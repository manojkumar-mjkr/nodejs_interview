const { parentPort, workerData } = require('worker_threads');
const xlsx = require('xlsx');
const mongoose = require('mongoose');
const path = require('path');

// Load models
const User = require(path.resolve(__dirname, '../models/user'));
const Agent = require(path.resolve(__dirname, '../models/agent'));
const UserAccount = require(path.resolve(__dirname, '../models/usersAccount'));
const LOB = require(path.resolve(__dirname, '../models/policyCategory'));
const Carrier = require(path.resolve(__dirname, '../models/policyCarrier'));
const Policy = require(path.resolve(__dirname, '../models/policyInfo'));

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/insurance', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(processFile).catch(err => {
  console.error('Worker: MongoDB connection failed', err);
  parentPort.postMessage({ status: 'error', error: err.message });
  process.exit(1);
});

async function getOrCreate(Model, query, createData = query) {
  let doc = await Model.findOne(query);
  if (!doc) {
    doc = new Model(createData);
    await doc.save();
  }
  return doc;
}

async function processFile() {
  try {
    const workbook = xlsx.readFile(workerData.filePath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = xlsx.utils.sheet_to_json(sheet);

    for (const row of data) {
      const agent = await getOrCreate(Agent, { name: row.agent });

      const account = await getOrCreate(UserAccount, {
        accountName: row.account_name,
        accountType: row.account_type,
        city: row.city
      });

      const lob = await getOrCreate(LOB, { categoryName: row.category_name });
      const carrier = await getOrCreate(Carrier, { companyName: row.company_name });

      const userDob = excelDateToJSDate(row.dob);
      // console.log("acc id = ",account._id);
      const user = await getOrCreate(User, {
        firstName: row.firstname,
        email: row.email
        }, {
        firstName: row.firstname,
        dob: new Date(`${userDob}  00:00:00`),
        address: row.address,
        phone: row.phone,//
        state: row.state,
        zip: row.zip,//
        email: row.email,
        gender: row.gender,
        userType: row.userType,
        accountId: account._id
      });

      // console.log("lob id = ",lob._id);
      // console.log("carrier id = ",carrier._id);
      // console.log("user id = ",user._id);

      console.log("policy_start_date sheet data = ",row.policy_start_date);
      console.log("policy_end_date sheet data = ",row.policy_end_date);

      
      const startDate = excelDateToJSDate(row.policy_start_date);
      const endDate = excelDateToJSDate(row.policy_end_date);


      console.log(" startDate converted to readable date = ",startDate);
      console.log(" endDate converted to readable date  = ",endDate);

      //console.log("policy_start_date after conversion = ",excelDateToJSDate(row.policy_start_date));
      //console.log("policy_end_date after conversion = ",excelDateToJSDate(row.policy_end_date));

      console.log(" startDate mongo =",new Date(`${startDate} 20:00:00`))
      console.log(" endDate mongo = ",new Date(`${endDate} 20:00:00`));


      const policy = new Policy({
        policyNumber: row.policy_number,
        policyStartDate: new Date(`${startDate}  00:00:00`),
        policyEndDate: new Date(`${endDate}  23:59:59`),
        categoryId: lob._id,
        carrierId: carrier._id,
        userId: user._id
      });

      await policy.save();
    }

    parentPort.postMessage({ status: 'done' });
    process.exit(0);
  } catch (error) {
    console.error('Worker Error:', error);
    parentPort.postMessage({ status: 'error', error: error.message });
    process.exit(1);
  }
}

function excelDateToJSDate(serial) {
  const utc_days = Math.floor(serial - 25569); // Excel epoch starts at Jan 1, 1900
  const utc_value = utc_days * 86400; // seconds per day
  const date = new Date(utc_value * 1000); // JS Date in milliseconds
  date.setUTCHours(0, 0, 0, 0); // Zero out time

  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0'); // Months are 0-based
  const day = String(date.getUTCDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}
