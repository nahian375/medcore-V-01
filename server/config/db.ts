// Database configuration placeholder
// We will use better-sqlite3 for this environment
import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.resolve(process.cwd(), 'mediconnect.db');
const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Initialize tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    google_id TEXT UNIQUE,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    photo TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS hospitals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    location TEXT NOT NULL,
    contact TEXT NOT NULL,
    website TEXT,
    speciality TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'Private',
    availability_status TEXT DEFAULT 'Available',
    latitude REAL,
    longitude REAL
  );

  CREATE TABLE IF NOT EXISTS medical_stores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    contact TEXT NOT NULL,
    latitude REAL NOT NULL,
    longitude REAL NOT NULL
  );

  CREATE TABLE IF NOT EXISTS tests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE
  );

  CREATE TABLE IF NOT EXISTS hospital_tests (
    hospital_id INTEGER,
    test_id INTEGER,
    price REAL,
    FOREIGN KEY (hospital_id) REFERENCES hospitals(id),
    FOREIGN KEY (test_id) REFERENCES tests(id),
    PRIMARY KEY (hospital_id, test_id)
  );

  CREATE TABLE IF NOT EXISTS blood_banks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    contact TEXT NOT NULL,
    website TEXT,
    latitude REAL,
    longitude REAL
  );
`);

// Seed sample data if empty
const hospitalCount = db.prepare('SELECT COUNT(*) as count FROM hospitals').get() as { count: number };
if (hospitalCount.count === 0) {
  const insert = db.prepare('INSERT INTO hospitals (name, location, contact, website, speciality, type, availability_status, latitude, longitude) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');
  const sampleHospitals = [
    // Public Hospitals
    ['Dhaka Medical College Hospital', 'Bakshibazar, Dhaka', '01715016984', 'http://dmc.gov.bd', 'Multispecialty, Government', 'Public', 'Available', 23.7258, 90.3973],
    ['Dhaka Leprosy Hospital', 'Dhaka', 'dlh@hospi.dghs.gov.bd', null, 'Leprosy Care, Government', 'Public', 'Available', 23.8103, 90.4125],
    ['Govt Homeopathic Medical College Hospital', 'Dhaka', 'dhdc@ac.dghs.gov.bd', null, 'Homeopathic Treatment, Government', 'Public', 'Available', 23.7500, 90.3800],
    ['Bangabandhu Sheikh Mujib Medical University (BSMMU)', 'Shahbag, Dhaka', '02-55165760', 'https://bsmmu.ac.bd', 'Multispecialty, Research, Postgraduate', 'Public', 'Available', 23.7391, 90.3958],
    ['BIRDEM General Hospital', 'Shahbag, Dhaka', '02-41050171', 'https://www.birdem.org.bd', 'Diabetes, Endocrinology, General Medicine', 'Public', 'Available', 23.7385, 90.3955],
    ['Kurmitola General Hospital', 'Cantonment, Dhaka', '0255062388', 'https://kgh.gov.bd', 'Multispecialty, Government', 'Public', 'Available', 23.8210, 90.4130],
    ['Shaheed Suhrawardy Hospital', 'Sher-e-Bangla Nagar, Dhaka', '02-9130800', null, 'Multispecialty, Government', 'Public', 'Available', 23.7695, 90.3715],
    ['Ad-Din Hospital', 'Moghbazar, Dhaka', '02-9353391', 'https://ad-din.org', 'Multispecialty, Public Listed', 'Public', 'Available', 23.7485, 90.4035],
    ['Sher-e-Bangla Medical College Hospital', 'Barisal', '0431-2173500', null, 'Multispecialty, Government', 'Public', 'Available', 22.6860, 90.3600],
    ['Rajshahi Medical College Hospital', 'Rajshahi', '0721-772150', null, 'Multispecialty, Government', 'Public', 'Available', 24.3700, 88.5800],
    ['Rangpur Medical College Hospital', 'Rangpur', '0521-62150', null, 'Multispecialty, Government', 'Public', 'Available', 25.7500, 89.2500],
    ['Mugda Medical College & Hospital', 'Mugda, Dhaka', '02-7272845', null, 'Multispecialty, Government', 'Public', 'Available', 23.7295, 90.4315],
    ['Sylhet MAG Osmani Medical College & Hospital', 'Sylhet', '0821-713667', null, 'Multispecialty, Government', 'Public', 'Available', 24.9000, 91.8600],
    ['Chittagong Medical College Hospital', 'Chittagong', '031-619400', null, 'Multispecialty, Government', 'Public', 'Available', 22.3500, 91.8300],
    ['Mymensingh Medical College Hospital', 'Mymensingh', '091-66063', null, 'Multispecialty, Government', 'Public', 'Available', 24.7500, 90.4000],
    ['Khwaja Yunus Ali Medical College & Hospital', 'Enayetpur, Sirajganj', '0751-64277', 'https://www.kyamch.org', 'Multispecialty, Semi-Govt', 'Public', 'Available', 24.2200, 89.7000],
    ['Institute of Child and Mother Health (ICMH)', 'Matuail, Dhaka', '02-7542692', 'https://icmh.org.bd', 'Maternal & Child Care, Government', 'Public', 'Available', 23.7000, 90.4700],
    ['National Institute of Cardiovascular Diseases', 'Sher-e-Bangla Nagar, Dhaka', '02-9122560', null, 'Specialized Heart Care, Government', 'Public', 'Available', 23.7700, 90.3700],
    ['National Institute of Mental Health and Hospital', 'Sher-e-Bangla Nagar, Dhaka', '02-9118171', null, 'Mental Health Services, Government', 'Public', 'Available', 23.7710, 90.3710],
    ['Centre for Rehabilitation of the Paralysed (CRP)', 'Savar, Dhaka', '02-7745464', 'https://crp-bangladesh.org', 'Rehabilitation, Govt-NGO', 'Public', 'Available', 23.8900, 90.2500],

    // Private Hospitals
    ['Evercare Hospital Dhaka', 'Bashundhara R/A, Dhaka', '+8809666710678', 'https://www.evercarebd.com', 'Multispecialty, Cardiology, Oncology', 'Private', 'Available', 23.8100, 90.4300],
    ['United Hospital Limited', 'Gulshan, Dhaka', '+8801914001234', 'https://www.uhlbd.com', 'Multispecialty, Cardiology, Nephrology', 'Private', 'Available', 23.7900, 90.4100],
    ['Square Hospitals Ltd.', 'West Panthapath, Dhaka', '+88028144400', 'https://www.squarehospital.com', 'Multispecialty, Surgery, Internal Medicine', 'Private', 'Available', 23.7500, 90.3800],
    ['Bangladesh Specialized Hospital Ltd.', 'Shyamoli, Dhaka', '09666-710606', 'https://www.bshl.com.bd', 'Multispecialty', 'Private', 'Available', 23.7700, 90.3600],
    ['Labaid Specialized Hospital', 'Dhanmondi, Dhaka', '10606', 'https://labaidgroup.com', 'Multispecialty, Cardiology, Gastroenterology', 'Private', 'Available', 23.7400, 90.3800],
    ['Ibn Sina Hospital Sylhet Ltd.', 'Sylhet', '0821-728645', 'https://www.ibnsinatrust.com', 'Multispecialty', 'Private', 'Available', 24.8900, 91.8700],
    ['Ibn Sina Hospitals', 'Dhaka', '10615', 'https://www.ibnsinatrust.com', 'Multispecialty', 'Private', 'Available', 23.7500, 90.3700],
    ['Greenland Hospital Ltd.', 'Uttara, Dhaka', '02-8932374', null, 'Multispecialty', 'Private', 'Available', 23.8700, 90.4000],
    ['Medinova Medical Services Ltd.', 'Dhaka', '02-9676611', 'https://medinova.com.bd', 'Diagnostic, Multispecialty', 'Private', 'Available', 23.7400, 90.3700],
    ['Gazi Medical College Hospital', 'Khulna', '041-763585', 'http://gmch.edu.bd', 'Multispecialty', 'Private', 'Available', 22.8200, 89.5500],
    ['Oasis Hospital (Pvt) Ltd.', 'Sylhet', '0821-713344', 'https://oasishospitalbd.com', 'Multispecialty', 'Private', 'Available', 24.9000, 91.8500],
    ['Royal Hospital & Research Center Ltd.', 'Chittagong', '031-652533', null, 'Multispecialty', 'Private', 'Available', 22.3600, 91.8200],
    ['Popular Specialized Hospital Ltd.', 'Dhanmondi, Dhaka', '09613-787801', 'https://popular-diagnostic.com', 'Multispecialty', 'Private', 'Available', 23.7400, 90.3800],
    ['Insaf Barakah Kidney & General Hospital', 'Moghbazar, Dhaka', '02-9350850', 'https://insafbarakah.com', 'Kidney & General Health', 'Private', 'Available', 23.7500, 90.4000],
    ['Medifair General Hospital', 'Dhaka (North)', 'maccamadinaghospital@gmail.com', null, 'Multispecialty', 'Private', 'Available', 23.8000, 90.4000],
    ['Shareef General Hospital Pvt. Ltd.', 'Gazipur', 'shareefgh@hotmail.net', null, 'Multispecialty', 'Private', 'Available', 23.9900, 90.4100],
    ['Life Aid Hospital', 'Thakurgaon', 'lifeaidh2015@gmail.com', null, 'Multispecialty', 'Private', 'Available', 26.0300, 88.4600],
    ['CDM Hospital', 'Rajshahi', '0721-773384', null, 'Multispecialty', 'Private', 'Available', 24.3700, 88.6000],
    ['Health Care Hospital', 'Sirajganj', '0751-64277', null, 'Multispecialty', 'Private', 'Available', 24.4500, 89.7000],
    ['Remedy Hospital & Diagnostic Centre', 'Savar, Dhaka', 'remedyhospital2019@gmail.com', null, 'Multispecialty', 'Private', 'Available', 23.8500, 90.2600],
    ['New Kotalipara Surgical Clinic', 'Gopalganj', '02-6656123', null, 'Surgical Clinic', 'Private', 'Available', 23.0000, 89.8200],
    ['Prime Hospital & Diagnostic Center', 'Khulna', '041-723456', null, 'Multispecialty', 'Private', 'Available', 22.8100, 89.5600],
    ['Shimantik Hospital & Training Institute', 'Sylhet', '0821-712345', null, 'Multispecialty', 'Private', 'Available', 24.8800, 91.8800],
    ['VARD Eye Hospital', 'Sunamganj', '0871-61234', null, 'Eye Hospital', 'Private', 'Available', 25.0600, 91.4000],
    ['Harun General Hospital (Pvt.) Ltd', 'Dhanmondi, Dhaka', '02-9661234', null, 'Multispecialty', 'Private', 'Available', 23.7400, 90.3800],
    ['Prime General Hospital', 'Narsingdi', 'primegeneralhospital737599@gmail.com', null, 'Multispecialty', 'Private', 'Available', 23.9200, 90.7200],
    ['Prime Hospital', 'Tangail', '0921-61234', null, 'Multispecialty', 'Private', 'Available', 24.2500, 89.9200],
    ['Goshairhat Adhunik Hospital', 'Shariatpur', '0601-61234', null, 'Multispecialty', 'Private', 'Available', 23.2000, 90.3500],
    ['Padma General Hospital & Diagnostic Centre', 'Dhaka', '02-9112345', null, 'Multispecialty', 'Private', 'Available', 23.7500, 90.3900],
    ['Moulvibazar Adhunik Eye Hospital', 'Moulvibazar', '0861-61234', null, 'Eye Hospital', 'Private', 'Available', 24.4800, 91.7700],
    ['Aslam Diagnostic Center', 'Dhaka', '02-8112345', null, 'Diagnostic', 'Private', 'Available', 23.7500, 90.3800],
    ['CB Diagnostic', 'Dhaka', '02-7112345', null, 'Diagnostic', 'Private', 'Available', 23.7300, 90.4100],
    ['Bolaka Digital Diagnostic Center', 'Dhaka', '02-6112345', null, 'Diagnostic', 'Private', 'Available', 23.7400, 90.4000],
    ['Medinet Medical Services', 'Dhaka', '02-5112345', null, 'Multispecialty', 'Private', 'Available', 23.7500, 90.3700],
    ['Maa Diagnostic Centre', 'Dhaka', '02-4112345', null, 'Diagnostic', 'Private', 'Available', 23.7600, 90.3800],
    ['Birampur Diagnostic Center', 'Dinajpur', '0531-61234', null, 'Diagnostic', 'Private', 'Available', 25.4500, 88.9500],
    ['Plasma Diagnostic Center', 'Dhaka', '02-3112345', null, 'Diagnostic', 'Private', 'Available', 23.7700, 90.3900],
    ['New Dhakadakshin Diagnostic Centre', 'Sylhet', '0821-61234', null, 'Diagnostic', 'Private', 'Available', 24.8500, 91.9500],
    ['K I Digital Hospital & Diagnostic Center', 'Dhaka', '02-2112345', null, 'Multispecialty', 'Private', 'Available', 23.7800, 90.4000],
    ['Seba Diagnostic Center', 'Dhaka', '02-1112345', null, 'Diagnostic', 'Private', 'Available', 23.7900, 90.4100],
    ['Padma Digital Diagnostic Center', 'Dhaka', '02-0112345', null, 'Diagnostic', 'Private', 'Available', 23.8000, 90.4200],
    ['EW VM Health Bangladesh Ltd', 'Dhaka', '02-9112345', null, 'Multispecialty', 'Private', 'Available', 23.8100, 90.4300],
    ['Rajshahi Medical College Hospital (RMCH)', 'Medical College Road, Laxmipur, Rajshahi-6100', '+880721-760254', null, 'Medicine, Surgery, Cardiology, Orthopedics, Neurology, Pediatrics, Gynecology, Dermatology, Psychiatry', 'Public', 'Available', 24.3700, 88.5800],
    ['Islami Bank Medical College Hospital', 'Medical Road, Rajshahi', '01711340582', null, 'Cardiology, General Medicine, Surgery, Gynecology, Pediatrics', 'Private', 'Available', 24.3700, 88.5800],
    ['Rajshahi Model Hospital', 'Rajshahi', 'N/A', null, 'Cardiology, Neurology, Orthopedics, ENT, Gynecology', 'Private', 'Available', 24.3700, 88.5800],
    ['Ibn Sina Diagnostic & Consultation Center', 'Rajshahi', 'N/A', null, 'Medicine, Gastroenterology, Cardiology', 'Private', 'Available', 24.3700, 88.5800],
    ['Amana Hospital Ltd', 'Rajshahi', 'N/A', null, 'Medicine, Surgery, Orthopedics, Gynecology', 'Private', 'Available', 24.3700, 88.5800],
    ['Shaheed Ziaur Rahman Medical College Hospital', 'Bogura', 'N/A', null, 'Medicine, Surgery, Pediatrics, Gynecology', 'Public', 'Available', 24.8500, 89.3700],
    ['Khwaja Yunus Ali Medical College Hospital', 'Sirajganj', 'N/A', null, 'Cardiology, Oncology, Nephrology, Neurology', 'Private', 'Available', 24.4500, 89.7000],
    ['Pabna Medical College Hospital', 'Pabna', 'N/A', null, 'Medicine, Surgery, Gynecology, Pediatrics', 'Public', 'Available', 24.0000, 89.2500],
    ['Natore Sadar Hospital', 'Natore', 'N/A', null, 'General Medicine', 'Public', 'Available', 24.4100, 89.0100],
    ['Chapainawabganj Sadar Hospital', 'Chapainawabganj', 'N/A', null, 'General Medicine', 'Public', 'Available', 24.5900, 88.2700],
    ['TMSS Medical College Hospital', 'Rangpur Road, Thengamara, Bogura', 'N/A', null, 'Medicine, Surgery, Gynecology & Obstetrics, Pediatrics, Cardiology', 'Private', 'Available', 24.8500, 89.3700],
    ['Mohammad Ali Hospital', 'Bogura Sadar, Bogura', 'N/A', null, 'Medicine, Surgery, Orthopedics, Pediatrics', 'Public', 'Available', 24.8500, 89.3700],
    ['Bogura General Hospital', 'Bogura', 'N/A', null, 'Medicine, Surgery, Gynecology', 'Public', 'Available', 24.8500, 89.3700],
    ['Popular Diagnostic Center (Bogura)', 'Bogura', 'N/A', null, 'Cardiology, Gastroenterology, Neurology', 'Private', 'Available', 24.8500, 89.3700],
    ['Naogaon Sadar Hospital', 'Naogaon', 'N/A', null, 'Medicine, Surgery, Pediatrics, Gynecology', 'Public', 'Available', 24.8000, 88.9400],
    ['Naogaon Modern Hospital', 'Naogaon', 'N/A', null, 'Medicine, Surgery, Orthopedics', 'Private', 'Available', 24.8000, 88.9400],
    ['Natore Modern Hospital', 'Natore', 'N/A', null, 'Medicine, Surgery, Gynecology', 'Private', 'Available', 24.4100, 89.0100],
    ['Joypurhat District Hospital', 'Joypurhat', 'N/A', null, 'Medicine, Surgery, Pediatrics', 'Public', 'Available', 25.1000, 89.0200],
    ['Central Hospital Pabna', 'Pabna', 'N/A', null, 'Medicine, Surgery, Gynecology', 'Private', 'Available', 24.0000, 89.2500],
    ['Green Life Hospital (Chapai Nawabganj)', 'Chapai Nawabganj', 'N/A', null, 'Medicine, Surgery, Pediatrics', 'Private', 'Available', 24.5900, 88.2700],
    ['Chittagong Medical College Hospital (CMCH)', 'K.B. Fazlul Kader Road, Panchlaish, Chattogram', 'N/A', null, 'Medicine, Surgery, Cardiology, Neurology, Pediatrics, Orthopedics, Gynecology & Obstetrics', 'Public', 'Available', 22.3569, 91.8322],
    ['Bangabandhu Memorial Hospital', 'Agrabad Commercial Area, Chattogram', 'N/A', null, 'Medicine, Cardiology, Orthopedics, Gynecology', 'Private', 'Available', 22.3245, 91.8123],
    ['Parkview Hospital Ltd', 'Panchlaish, Chattogram', 'N/A', null, 'Cardiology, Neurology, Gastroenterology, Orthopedics, Gynecology', 'Private', 'Available', 22.3580, 91.8300],
    ['Imperial Hospital Ltd', 'Zakir Hossain Road, Chattogram', 'N/A', null, 'Cardiology, Oncology, Neurology, Pediatrics', 'Private', 'Available', 22.3600, 91.8000],
    ['Chevron Clinical Laboratory', 'Mehedibag, Chattogram', 'N/A', null, 'Pathology, Cardiology', 'Private', 'Available', 22.3450, 91.8250],
    ['National Hospital Chattogram', 'Mehedibag Road, Chattogram', 'N/A', null, 'Medicine, Surgery, Orthopedics, Gynecology', 'Private', 'Available', 22.3450, 91.8250],
    ['Ibn Sina Diagnostic Center (Chattogram)', 'Chattogram', 'N/A', null, 'Cardiology, Medicine, Gastroenterology', 'Private', 'Available', 22.3500, 91.8200],
    ['Chattogram General Hospital', 'Anderkilla, Chattogram', 'N/A', null, 'Medicine, Surgery, Pediatrics', 'Public', 'Available', 22.3350, 91.8350],
    ['Cox’s Bazar District Hospital', 'Cox’s Bazar', 'N/A', null, 'Medicine, Surgery, Pediatrics, Gynecology', 'Public', 'Available', 21.4339, 91.9870],
    ['Cox’s Bazar Medical College Hospital', 'Cox’s Bazar', 'N/A', null, 'Medicine, Surgery, Orthopedics, Gynecology', 'Public', 'Available', 21.4339, 91.9870],
    ['Cumilla Medical College Hospital', 'Kuchaitoli, Cumilla', 'N/A', null, 'Medicine, Surgery, Cardiology, Pediatrics, Gynecology & Obstetrics', 'Public', 'Available', 23.4600, 91.1800],
    ['Cumilla General Hospital (250 Bed)', 'Cumilla Sadar, Cumilla', 'N/A', null, 'Medicine, Surgery, Pediatrics, Gynecology', 'Public', 'Available', 23.4600, 91.1800],
    ['Moon Hospital Cumilla', 'Cumilla', 'N/A', null, 'Medicine, Surgery, Orthopedics, Gynecology', 'Private', 'Available', 23.4600, 91.1800],
    ['Feni General Hospital', 'Feni Sadar, Feni', 'N/A', null, 'Medicine, Surgery, Pediatrics, Gynecology', 'Public', 'Available', 23.0159, 91.3976],
    ['Feni Diagnostic Center', 'Feni', 'N/A', null, 'Cardiology, Medicine', 'Private', 'Available', 23.0159, 91.3976],
    ['Noakhali General Hospital (250 Bed)', 'Maijdee Court, Noakhali', 'N/A', null, 'Medicine, Surgery, Pediatrics, Gynecology', 'Public', 'Available', 22.8696, 91.0993],
    ['Noakhali Medical College Hospital', 'Maijdee, Noakhali', 'N/A', null, 'Medicine, Surgery, Orthopedics, Pediatrics, Gynecology', 'Public', 'Available', 22.8696, 91.0993],
    ['Lakshmipur Sadar Hospital', 'Lakshmipur', 'N/A', null, 'Medicine, Surgery, Pediatrics', 'Public', 'Available', 22.9447, 90.8282],
    ['Rangamati General Hospital', 'Rangamati', 'N/A', null, 'Medicine, Surgery, Pediatrics', 'Public', 'Available', 22.6533, 92.1525],
    ['Bandarban Sadar Hospital', 'Bandarban', 'N/A', null, 'Medicine, Surgery, Pediatrics', 'Public', 'Available', 22.1953, 92.2184],
    ['Khagrachari District Sadar Hospital', 'Khagrachari Sadar, Khagrachari', 'N/A', null, 'Medicine, Surgery, Pediatrics, Gynecology', 'Public', 'Available', 23.1105, 91.9950],
    ['Chattogram Metropolitan Hospital', 'Agrabad, Chattogram', 'N/A', null, 'Medicine, Cardiology, Orthopedics, Gynecology', 'Private', 'Available', 22.3245, 91.8123],
    ['Epic Healthcare Chattogram', 'Mehedibag Road, Chattogram', 'N/A', null, 'Cardiology, Neurology, Gastroenterology', 'Private', 'Available', 22.3450, 91.8250],
    ['CSCR Hospital Ltd', 'Panchlaish, Chattogram', 'N/A', null, 'Medicine, Cardiology, Neurology, Orthopedics', 'Private', 'Available', 22.3580, 91.8300],
    ['Surgiscope Hospital Ltd', 'Panchlaish, Chattogram', 'N/A', null, 'Surgery, Orthopedics, Gynecology', 'Private', 'Available', 22.3580, 91.8300],
    ['People\'s Hospital Ltd', 'Agrabad, Chattogram', 'N/A', null, 'Medicine, Surgery, Pediatrics', 'Private', 'Available', 22.3245, 91.8123],
    ['Sandwip Upazila Health Complex', 'Sandwip Island, Chattogram', 'N/A', null, 'Medicine, Surgery, Pediatrics, Gynecology', 'Public', 'Available', 22.4800, 91.4400],
    ['Sitakunda Upazila Health Complex', 'Sitakunda, Chattogram', 'N/A', null, 'Medicine, Surgery, Pediatrics', 'Public', 'Available', 22.6200, 91.6600],
    ['Lohagara Upazila Health Complex', 'Lohagara, Chattogram', 'N/A', null, 'Medicine, Surgery, Pediatrics, Gynecology', 'Public', 'Available', 22.0500, 92.1000],
    ['Satkania Upazila Health Complex', 'Satkania, Chattogram', 'N/A', null, 'Medicine, Surgery, Pediatrics', 'Public', 'Available', 22.0800, 92.0500],
    ['Sylhet MAG Osmani Medical College Hospital', 'Medical Road, Sylhet City', 'N/A', null, 'Medicine, Surgery, Pathology, Microbiology, Radiology', 'Public', 'Available', 24.9000, 91.8600],
    ['Ibn Sina Hospital Sylhet Ltd.', 'Sobhani Ghat Point, Sylhet', 'N/A', null, 'Multispecialty, Pathology, Radiology', 'Private', 'Available', 24.8850, 91.8750],
    ['Labaid Diagnostic Center Sylhet', 'New Medical Road, Kajolshah, Sylhet', 'N/A', null, 'Diagnostic, Pathology, Radiology', 'Private', 'Available', 24.8980, 91.8650],
    ['Northeast Medical College Hospital', 'South Surma, Sylhet', 'N/A', null, 'Medicine, Surgery, Pathology, Radiology', 'Private', 'Available', 24.8700, 91.8700],
    ['Mount Adora Hospital', 'Mirboxtula, Nayasarak, Sylhet', 'N/A', null, 'Multispecialty, Pathology, Radiology', 'Private', 'Available', 24.8950, 91.8700],
    ['Oasis Hospital Ltd.', 'Subhanighat, Sylhet', 'N/A', null, 'Medicine, Surgery, Pathology, Radiology', 'Private', 'Available', 24.8850, 91.8750],
    ['Noorjahan Hospital Ltd.', 'Dargah Gate / Shibganj, Sylhet', 'N/A', null, 'Medicine, Surgery, Pathology, Radiology', 'Private', 'Available', 24.8990, 91.8750],
    ['Medinova Medical Services', 'Kajolshah, Sylhet', 'N/A', null, 'Diagnostic, Pathology, Radiology', 'Private', 'Available', 24.8980, 91.8650],
    ['Comfort Medical Services', 'New Medical Road, Sylhet', 'N/A', null, 'Diagnostic, Pathology, Radiology', 'Private', 'Available', 24.8980, 91.8650],
    ['Sheba Poly Clinic', 'Mirer Maidan, Sylhet', 'N/A', null, 'Medicine, Pathology, Radiology', 'Private', 'Available', 24.8950, 91.8600],
    ['Parkview Medical College Hospital', 'VIP Road, Sylhet', 'N/A', null, 'Medicine, Surgery, Pathology, Radiology', 'Private', 'Available', 24.8900, 91.8700],
    ['Jalalabad Ragib-Rabeya Medical College Hospital', 'Pathantula, Sylhet', 'N/A', null, 'Medicine, Surgery, Pathology, Radiology', 'Private', 'Available', 24.9100, 91.8500],
    ['Sylhet Women’s Medical College Hospital', 'Nayasarak, Sylhet', 'N/A', null, 'Gynecology, Medicine, Surgery, Pathology', 'Private', 'Available', 24.8950, 91.8700],
    ['Al Haramain Hospital Pvt. Ltd.', 'Subhanighat, Sylhet', 'N/A', null, 'Medicine, Surgery, Pathology, Radiology', 'Private', 'Available', 24.8850, 91.8750],
    ['Popular Medical Center & Hospital', 'Subhanighat, Sylhet', 'N/A', null, 'Medicine, Surgery, Pathology, Radiology', 'Private', 'Available', 24.8850, 91.8750],
    ['Popular Medical Center', 'Kajolshah, Sylhet', 'N/A', null, 'Diagnostic, Pathology, Radiology', 'Private', 'Available', 24.8980, 91.8650],
    ['Sylhet Diabetic Hospital', 'Puranlane Road, Sylhet', 'N/A', null, 'Endocrinology, Diabetology, Pathology', 'Private', 'Available', 24.8900, 91.8650],
    ['National Heart Foundation Hospital (Sylhet Branch)', 'Tilagor, Sylhet', 'N/A', null, 'Cardiology, Pathology', 'Private', 'Available', 24.8950, 91.8900],
    ['Royal Hospital & Research Center', 'Kazi Ilias Road, Sylhet', 'N/A', null, 'Medicine, Surgery, Pathology, Radiology', 'Private', 'Available', 24.8950, 91.8650],
    ['Mohanagar Hospital', 'Dargah Moholla, Sylhet', 'N/A', null, 'Medicine, Surgery, Pathology, Radiology', 'Private', 'Available', 24.8990, 91.8700],
    ['Brighton Hospital', 'Mirabazar, Sylhet', 'N/A', null, 'Medicine, Surgery, Pathology, Radiology', 'Private', 'Available', 24.8900, 91.8800],
    ['Trust Medical Services', 'Sylhet City', 'N/A', null, 'Diagnostic, Pathology, Radiology', 'Private', 'Available', 24.8949, 91.8687],
    ['Health Care Hospital & Trauma Center', 'Medical Road, Sylhet', 'N/A', null, 'Traumatology, Orthopedics, Pathology, Radiology', 'Private', 'Available', 24.9000, 91.8600],
    ['Fair Health Hospital', 'Mirer Moydan, Sylhet', 'N/A', null, 'Medicine, Surgery, Pathology, Radiology', 'Private', 'Available', 24.8950, 91.8600],
    ['Medi-Aid Diagnostic & Consultation Center', 'Sylhet', 'N/A', null, 'Diagnostic, Pathology, Radiology', 'Private', 'Available', 24.8949, 91.8687],
    ['Ibn Sina Diagnostic & Consultation Center', 'Rikabibazar, Sylhet', 'N/A', null, 'Diagnostic, Pathology, Radiology', 'Private', 'Available', 24.8950, 91.8650],
    ['Sylhet Shishu Clinic & General Hospital', 'Upokhantho Road, Sylhet', 'N/A', null, 'Pediatrics, General Medicine, Pathology', 'Private', 'Available', 24.8900, 91.8700],
    ['Anwar General Hospital', 'Chandnighat, Sylhet', 'N/A', null, 'General Medicine, Pathology, Radiology', 'Private', 'Available', 24.8800, 91.8700],
    ['Square Hospital Sylhet (Diagnostic Center)', 'Medical College Road, Sylhet', 'N/A', null, 'Diagnostic, Pathology, Radiology', 'Private', 'Available', 24.9000, 91.8600],
    ['Mount Adora Hospital (Akhalia Branch)', 'Akhalia, Sylhet', 'N/A', null, 'Medicine, Surgery, Pathology, Radiology', 'Private', 'Available', 24.9150, 91.8450],
    ['Khulna Medical College Hospital', 'Boyra, Khulna City', 'N/A', null, 'Medicine, Surgery, Pathology, Radiology', 'Public', 'Available', 22.8250, 89.5400],
    ['Khulna 250 Bed General Hospital', 'Khulna Sadar, Khulna City', 'N/A', null, 'Medicine, Surgery, Pathology, Radiology', 'Public', 'Available', 22.8150, 89.5600],
    ['Shaheed Shaikh Abu Naser Specialized Hospital', 'Khulna City', 'N/A', null, 'Specialized care, Pathology, Radiology', 'Public', 'Available', 22.8300, 89.5500],
    ['Khulna City Medical College & Hospital', 'KDA Avenue, Khulna City', 'N/A', null, 'Cardiology, Pediatrics, Gynecology, Surgery', 'Private', 'Available', 22.8200, 89.5550],
    ['Gazi Medical College Hospital', 'Sonadanga, Khulna', 'N/A', null, 'Medicine, Surgery, Maternity', 'Private', 'Available', 22.8220, 89.5450],
    ['Islami Bank Hospital, Khulna', 'KDA Avenue, Khulna', 'N/A', null, 'General Medicine, Surgery', 'Private', 'Available', 22.8200, 89.5550],
    ['Ad-Din Akij Medical College Hospital', 'Boyra, Khulna', 'N/A', null, 'Medicine, Surgery, Pathology', 'Private', 'Available', 22.8250, 89.5400],
    ['Khulna Shishu Hospital', 'Shibbari More, Khulna', 'N/A', null, 'Pediatrics', 'Public', 'Available', 22.8180, 89.5580],
    ['Khulna Chest Disease Hospital', 'Chhoto Boyra, Khulna', 'N/A', null, 'Respiratory care, Tuberculosis', 'Public', 'Available', 22.8280, 89.5420],
    ['Fortis Escorts Heart Institute, Khulna', 'Khulna', 'N/A', null, 'Cardiology', 'Private', 'Available', 22.8200, 89.5500],
    ['Bangladesh Eye Hospital & Laser Center', 'Khulna', 'N/A', null, 'Ophthalmology', 'Private', 'Available', 22.8200, 89.5500],
    ['Labcon Diagnostic & Consultation Center', 'Khulna', 'N/A', null, 'Diagnostic, Pathology, Radiology', 'Private', 'Available', 22.8200, 89.5500],
    ['Popular Diagnostic Center, Khulna', 'Khulna', 'N/A', null, 'Diagnostic, Pathology, Radiology', 'Private', 'Available', 22.8200, 89.5500],
    ['Best Care Clinic & Diagnostic Center', 'Khulna', 'N/A', null, 'Primary care, Diagnostic', 'Private', 'Available', 22.8200, 89.5500],
    ['Citizen Lab Doctor & Diagnostic', 'Khulna', 'N/A', null, 'Diagnostic, Pathology', 'Private', 'Available', 22.8200, 89.5500],
    ['Alif Diagnostic & Consultation Center', 'Khan Jahan Ali Road, Khulna', 'N/A', null, 'Diagnostic, Pathology', 'Private', 'Available', 22.8150, 89.5650],
    ['Star Diagnostic & Consultation Center', 'Khulna', 'N/A', null, 'Diagnostic, Pathology', 'Private', 'Available', 22.8200, 89.5500],
    ['A Samad Memorial Hospital & Diagnostic Center', 'Khulna', 'N/A', null, 'Medicine, Diagnostic', 'Private', 'Available', 22.8200, 89.5500],
    ['Bangladesh Diagnostic & Consultation Center', 'Shamsur Rahman Road, Khulna', 'N/A', null, 'Diagnostic, Pathology', 'Private', 'Available', 22.8160, 89.5620],
    ['Ankur Diagnostic & Health Care', 'Sonadanga, Khulna', 'N/A', null, 'Diagnostic, Pathology', 'Private', 'Available', 22.8220, 89.5450],
    ['Khulna Eye Hospital & Laser Center', 'Shibbari, Khulna', 'N/A', null, 'Ophthalmology', 'Private', 'Available', 22.8180, 89.5580],
    ['Labaid Diagnostic Ltd - Khulna', 'Khulna City', 'N/A', null, 'Diagnostic, Pathology', 'Private', 'Available', 22.8200, 89.5500],
    ['Prince Hospitals - Khulna', 'Khulna', 'N/A', null, 'General Medicine', 'Private', 'Available', 22.8200, 89.5500],
    ['Royal Diagnostic & Consultation Limited', 'Khulna', 'N/A', null, 'Diagnostic, Pathology', 'Private', 'Available', 22.8200, 89.5500],
    ['Sandhani Clinic & Diagnostic Complex', 'Khulna', 'N/A', null, 'Diagnostic, Pathology', 'Private', 'Available', 22.8200, 89.5500],
    ['Doctors Point Specialized Hospital', 'Khulna', 'N/A', null, 'General Medicine', 'Private', 'Available', 22.8200, 89.5500],
    ['250 Bed General Hospital - Jessore', 'Jessore', 'N/A', null, 'General Medicine', 'Public', 'Available', 23.1667, 89.2000],
    ['250 Bed General Hospital - Bagerhat', 'Bagerhat', 'N/A', null, 'General Medicine', 'Public', 'Available', 22.6500, 89.7833],
    ['Satkhira Sadar Hospital', 'Satkhira', 'N/A', null, 'General Medicine', 'Public', 'Available', 22.7167, 89.0833],
    ['Kushtia District Hospital', 'Kushtia', 'N/A', null, 'General Medicine', 'Public', 'Available', 23.9000, 89.1167],
    ['Sher-e-Bangla Medical College Hospital', 'Barishal City, Barishal', 'N/A', null, 'Medicine, Surgery, Pathology, Radiology', 'Public', 'Available', 22.6900, 90.3600],
    ['Barishal District Sadar Hospital', 'Barishal Sadar', 'N/A', null, 'General Medicine, Pathology', 'Public', 'Available', 22.7000, 90.3650],
    ['Barishal Women’s Medical College Hospital', 'Barishal City', 'N/A', null, 'Maternity, Gynecology', 'Private', 'Available', 22.6950, 90.3600],
    ['Udayan Hospital & Diagnostic Center', 'Barishal', 'N/A', null, 'Diagnostic, Pathology, Radiology', 'Private', 'Available', 22.7000, 90.3600],
    ['Universal Hospital & Diagnostic Center', 'Barishal', 'N/A', null, 'Diagnostic, Pathology', 'Private', 'Available', 22.7000, 90.3600],
    ['Rahman Medical Hospital', 'Barishal', 'N/A', null, 'Medicine, Pathology, Radiology', 'Private', 'Available', 22.7000, 90.3600],
    ['Barishal Shishu Hospital', 'Barishal', 'N/A', null, 'Pediatrics', 'Public', 'Available', 22.7000, 90.3600],
    ['Shapla Medical Center', 'Barishal City', 'N/A', null, 'Multi-specialty', 'Private', 'Available', 22.7000, 90.3600],
    ['Labaid Diagnostic & Consultation Center - Barishal', 'Barishal', 'N/A', null, 'Diagnostic, Pathology, Radiology', 'Private', 'Available', 22.7000, 90.3600],
    ['Al-Haramin Diagnostic Center', 'Barishal City', 'N/A', null, 'Diagnostic, Pathology', 'Private', 'Available', 22.7000, 90.3600],
    ['Rahat Anwar Hospital', 'Band Road, Barishal City', '+8801711-9939529', null, 'General medicine, Surgery', 'Private', 'Available', 22.6950, 90.3650],
    ['Islami Bank Hospital - Barishal', 'Chandmari, Barishal', '+8801718-237662', null, 'Internal medicine, Maternity', 'Private', 'Available', 22.6900, 90.3600],
    ['Barishal General Hospital', 'Hospital Road, Barishal', '+8801730-324760', null, 'General Medicine', 'Public', 'Available', 22.7000, 90.3650],
    ['Arif Memorial Hospital', 'Kali Bari Road, Barishal', '+8801758-286878', null, 'Cardiology, Orthopedics, Neurology', 'Private', 'Available', 22.7000, 90.3600],
    ['Apollo Diagnostic Complex (Pvt) Ltd.', '135 Sadar Road, Barishal', '+880431-2174019', null, 'Diagnostic, Pathology', 'Private', 'Available', 22.7000, 90.3650],
    ['Ambia Memorial Hospital', 'Bogura Road, Barishal', '+880431-2175364', null, 'General Medicine', 'Private', 'Available', 22.7050, 90.3600],
    ['Fair Health Clinic', 'Kalibari Road, Barishal', '+880431-644129', null, 'Diagnostic', 'Private', 'Available', 22.7000, 90.3600],
    ['Seba Clinic', 'Bando Road, Barishal', '+8801711-4652539', null, 'Primary care', 'Private', 'Available', 22.6950, 90.3650],
    ['Barishal Central Diagnostic Center Ltd', 'Barishal Sadar', 'bchmcc@gmail.com', null, 'Diagnostic, Pathology', 'Private', 'Available', 22.7000, 90.3650],
    ['Bhola Popular Diagnostic Center', 'Bhola Sadar, Bhola', 'bholapopulardiagnostic09@gmail.com', null, 'Diagnostic, Pathology', 'Private', 'Available', 22.6833, 90.6500],
    ['Rangpur Medical College & Hospital', 'Medical East Gate, Health City Road, Dhap, Rangpur', '+880521-53881', null, 'Medicine, Surgery, Pathology, Radiology', 'Public', 'Available', 25.7600, 89.2400],
    ['Rangpur Community Medical College Hospital (RCMCH)', 'Medical East Gate, Health City Road, Dhap, Rangpur', '+8801711-992732', null, 'Cardiology, Pathology, Radiology', 'Private', 'Available', 25.7600, 89.2400],
    ['Prime Medical College Hospital', 'Pirjabad, Badargonj Road, Rangpur', '+8801730-033110', null, 'Cardiology, Pathology, Radiology', 'Private', 'Available', 25.7500, 89.2300],
    ['Sadar Hospital - Rangpur', 'Rangpur City', '+880521-63043', null, 'General Medicine, Maternity', 'Public', 'Available', 25.7500, 89.2500],
    ['Update Diagnostic', 'Dhap, Jail Road, Rangpur', '+8801971-555555', null, 'Diagnostic, Pathology, Radiology', 'Private', 'Available', 25.7550, 89.2450],
    ['Popular Diagnostic Center - Rangpur', '77/1, Jail Road, Dhap, Rangpur', '+8809613-787813', null, 'Diagnostic, Pathology', 'Private', 'Available', 25.7550, 89.2450],
    ['Labaid Diagnostic - Rangpur', 'Jail Road, Rangpur City', '+8801714-212524', null, 'Diagnostic, Pathology, Radiology', 'Private', 'Available', 25.7550, 89.2450],
    ['Health City Specialized Hospital & Diagnostic Center', 'Shimultoli Road, Rangpur', '+8801711-992732', null, 'Diagnostic, Pathology, Radiology', 'Private', 'Available', 25.7500, 89.2500],
    ['Good Health Hospital', 'Dhap Jail Road, Rangpur', '+8801717-974489', null, 'General Medicine, Surgery', 'Private', 'Available', 25.7550, 89.2450],
    ['General Diagnostic Center - Rangpur', 'Dhaap Jail Road, Rangpur', '+8801773-896360', null, 'Diagnostic, Pathology, Radiology', 'Private', 'Available', 25.7550, 89.2450],
    ['CMH Hospital Rangpur', 'Dhap Road, Rangpur', '+8801769-663322', null, 'General Medicine', 'Private', 'Available', 25.7550, 89.2450],
    ['Rangpur Central Hospital', 'Mouchak Complex, Dhap Road, Rangpur', '+8801737-894558', null, 'General Medicine', 'Private', 'Available', 25.7550, 89.2450],
    ['Dinajpur 250-Bed General Hospital', 'Dinajpur City', '+880531-64023', null, 'General Medicine, Maternity', 'Public', 'Available', 25.6200, 88.6300],
    ['Gaibandha District Hospital', 'Gaibandha City', '+880541-61516', null, 'General Medicine', 'Public', 'Available', 25.3300, 89.5400],
    ['Kurigram 250-Bed District Hospital', 'Kurigram Sadar', '+880581-61466', null, 'General Medicine', 'Public', 'Available', 25.8100, 89.6500],
    ['Nilphamari 250-Bed District Hospital', 'Nilphamari City', '+880551-61222', null, 'General Medicine', 'Public', 'Available', 25.9400, 88.8400],
    ['Saidpur 100-Bed Hospital', 'Saidpur, Nilphamari', '+880552-672333', null, 'General Medicine', 'Public', 'Available', 25.7800, 88.8900],
    ['Panchagarh District Hospital', 'Panchagarh Sadar', '+880568-61656', null, 'General Medicine', 'Public', 'Available', 26.3300, 88.5600],
    ['Thakurgaon Sadar Hospital', 'Thakurgaon', 'N/A', null, 'General Medicine', 'Public', 'Available', 26.0300, 88.4600],
    ['Lalmonirhat General Hospital', 'Lalmonirhat', 'N/A', null, 'General Medicine', 'Public', 'Available', 25.9100, 89.4500],
    ['Dinajpur Medical College Hospital', 'Dinajpur', 'N/A', null, 'Medicine, Surgery, Pathology, Radiology', 'Public', 'Available', 25.6300, 88.6400]
  ];
  
  for (const h of sampleHospitals) {
    insert.run(...h);
  }
}

// Seed medical stores
const storeCount = db.prepare('SELECT COUNT(*) as count FROM medical_stores').get() as { count: number };
if (storeCount.count === 0) {
  const insertStore = db.prepare('INSERT INTO medical_stores (name, address, contact, latitude, longitude) VALUES (?, ?, ?, ?, ?)');
  const sampleStores = [
    ['Lazz Pharma (Panthapath)', 'Panthapath, Dhaka', '01711-123456', 23.7510, 90.3850],
    ['Tamanna Pharmacy', 'Dhanmondi, Dhaka', '01811-234567', 23.7450, 90.3750],
    ['Khidmah Pharma', 'Khilgaon, Dhaka', '01911-345678', 23.7550, 90.4250],
    ['Model Pharmacy', 'Gulshan, Dhaka', '01611-456789', 23.7950, 90.4150],
    ['Dhaka Pharma', 'Uttara, Dhaka', '01511-567890', 23.8750, 90.4050],
    ['Blue Pharma', 'Mirpur, Dhaka', '01311-678901', 23.8050, 90.3650],
    ['Green Pharma', 'Mohammadpur, Dhaka', '01411-789012', 23.7650, 90.3550],
    ['City Pharma', 'Moghbazar, Dhaka', '01722-123456', 23.7500, 90.4000],
    ['Care Pharma', 'Banani, Dhaka', '01822-234567', 23.7900, 90.4000],
    ['Health Pharma', 'Badda, Dhaka', '01922-345678', 23.7800, 90.4300]
  ];

  for (const s of sampleStores) {
    insertStore.run(...s);
  }
}

// Seed tests and hospital_tests
const testCount = db.prepare('SELECT COUNT(*) as count FROM tests').get() as { count: number };
if (testCount.count === 0) {
  const tests = [
    'Blood Test (CBC)', 'MRI Scan', 'CT Scan', 'X-Ray', 'Ultrasound', 
    'ECG', 'Endoscopy', 'Biopsy', 'COVID-19 PCR', 'Thyroid Profile',
    'Lipid Profile', 'Liver Function Test', 'Kidney Function Test',
    'Blood Sugar (Fasting)', 'Urine Analysis'
  ];
  
  const insertTest = db.prepare('INSERT INTO tests (name) VALUES (?)');
  for (const test of tests) {
    insertTest.run(test);
  }

  const allHospitals = db.prepare('SELECT id FROM hospitals').all() as { id: number }[];
  const allTests = db.prepare('SELECT id FROM tests').all() as { id: number }[];
  
  const insertHospitalTest = db.prepare('INSERT INTO hospital_tests (hospital_id, test_id, price) VALUES (?, ?, ?)');
  
  // Randomly assign tests to hospitals
  for (const hospital of allHospitals) {
    // Assign 5-10 random tests to each hospital
    const numTests = Math.floor(Math.random() * 6) + 5;
    const shuffledTests = [...allTests].sort(() => 0.5 - Math.random());
    const selectedTests = shuffledTests.slice(0, numTests);
    
    for (const test of selectedTests) {
      const price = Math.floor(Math.random() * 5000) + 500; // Random price between 500 and 5500
      insertHospitalTest.run(hospital.id, test.id, price);
    }
  }
}

// Seed blood banks
const bloodBankCount = db.prepare('SELECT COUNT(*) as count FROM blood_banks').get() as { count: number };
if (bloodBankCount.count === 0) {
  const insertBloodBank = db.prepare('INSERT INTO blood_banks (name, address, contact, website, latitude, longitude) VALUES (?, ?, ?, ?, ?, ?)');
  const sampleBloodBanks = [
    ['Bangladesh Red Crescent Society Blood Bank', '7/5, Aurongzeb Road, Mohammadpur, Dhaka', '+880 2-48121182', 'https://bdrcs.org', 23.7588, 90.3622],
    ['Quantum Blood Bank (Shantinagar)', '119, Shantinagar, Dhaka', '+880 2-9351969', 'https://quantummethod.org.bd', 23.7410, 90.4120],
    ['Sandhani Blood Bank (Central)', 'Room 35, BSMMU, Shahbag, Dhaka', '+880 2-8621658', 'http://sandhani.org', 23.7391, 90.3958],
    ['Badhan Blood Bank & Transfusion Center', 'TSC (Ground Floor), University of Dhaka, Dhaka', '+880 2-8629042', 'https://badhan.org', 23.7330, 90.3960],
    ['Police Blood Bank', 'Central Police Hospital, Rajarbag, Dhaka', '+880 2-9362573', null, 23.7400, 90.4150],
    ['Bangladesh Blood Bank & Transfusion Center', '12/22 Babar Road, Mohammadpur, Dhaka', '+88017-76291633', null, 23.7590, 90.3610],
    ['Retina Blood Bank', '2K/A-5, Nowab Habibullah Road, Shahbag, Dhaka', '+880 2-9663853', null, 23.7380, 90.3970],
    ['Islami Bank Hospital Blood Bank', '30, VIP Road, Kakrail, Dhaka', '+880 2-8317090', null, 23.7430, 90.4080],
    ['Fatema Begum Red Crescent Blood Center', 'Anderkilla, Chattogram', '01815-850533', null, 22.3380, 91.8370],
    ['Begum Tayeeba Mojumder Red Crescent Blood Center', 'Dinajpur', '01765-311450', null, 25.6270, 88.6330]
  ];

  for (const b of sampleBloodBanks) {
    insertBloodBank.run(...b);
  }
}

export default db;
