import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI } from "@google/genai";
import { Button } from '../components/common/Button';
import { Building2, Phone, Search, Loader2, MapPin, ExternalLink, CheckCircle2, Navigation, Sparkles, AlertCircle, Info } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import api from '../services/api';

interface Hospital {
  id: number;
  name: string;
  location: string;
  contact: string;
  website: string | null;
  speciality: string;
  type: 'Public' | 'Private';
  availability_status: string;
  about?: string;
  email?: string;
}

const STATIC_HOSPITALS: Hospital[] = [
  {
    id: 1,
    name: "Dhaka Medical College Hospital",
    location: "Secretariat Road, Shahbagh, Dhaka-1000",
    contact: "+880-2-8626812-16",
    website: "https://dmch.gov.bd/",
    email: "dmch@hospi.dghs.gov.bd",
    speciality: "Emergency, Medicine, Surgery, ICU",
    type: "Public",
    availability_status: "Open 24/7",
    about: "Established in 1946; one of the oldest and largest government tertiary hospitals in Bangladesh. Functions as both a medical college and teaching hospital affiliated with the University of Dhaka."
  },
  {
    id: 2,
    name: "Bangabandhu Sheikh Mujib Medical University",
    location: "Kazi Nazrul Islam Avenue, Shahbagh, Dhaka-1000",
    contact: "+880-2-55165600",
    website: "https://bsmmu.edu.bd/",
    speciality: "Advanced care + Research",
    type: "Public",
    availability_status: "Open 24/7",
    about: "Premier government medical university and hospital in Bangladesh. Offers advanced clinical services across specialties plus postgraduate medical education and research."
  },
  {
    id: 3,
    name: "Dhaka Shishu Hospital",
    location: "Sher-e-Bangla Nagar, Dhaka-1207",
    contact: "+880-2-8114571",
    website: "https://dhakashishuhospital.org",
    email: "info@shishu-microbiology.org",
    speciality: "Child care, pediatrics, surgery",
    type: "Public",
    availability_status: "Open 24/7",
    about: "Child health hospital established in 1972. Specializes in pediatric medicine and pediatric surgery. One of the largest children’s hospitals in Bangladesh."
  },
  {
    id: 4,
    name: "Institute of Child & Mother Health (ICMH)",
    location: "Matuail, Dhaka-1362",
    contact: "+880-2-7542627",
    website: "https://icmh.org.bd/",
    email: "info@icmh.org.bd",
    speciality: "Mother & child health, obstetrics",
    type: "Public",
    availability_status: "Open 24/7",
    about: "A national institute focused on maternal and child health care, research, and training. Services include obstetrics & gynecology, pediatrics, radiology, and lab medicine."
  },
  {
    id: 5,
    name: "Kurmitola General Hospital",
    location: "Kurmitola, Dhaka-1206",
    contact: "N/A",
    website: null,
    speciality: "Surgery, Cardiology, ICU",
    type: "Public",
    availability_status: "Open 24/7",
    about: "A 500-bed government hospital established in 2012. Offers medicine, pediatrics, cardiology, surgery, orthopaedics and more."
  },
  {
    id: 6,
    name: "Holy Family Red Crescent Medical College & Hospital",
    location: "Dhaka, Bangladesh",
    contact: "+880-2-8311721-23",
    website: null,
    speciality: "General & clinical care",
    type: "Private",
    availability_status: "Open 24/7",
    about: "Private medical college and hospital affiliated with Red Crescent Society. Provides a range of clinical services along with medical education."
  },
  {
    id: 7,
    name: "Enam Medical College & Hospital",
    location: "9/3 Parboti Nagar, Thana Road, Savar, Dhaka-1340",
    contact: "+880-17-18846107",
    website: "https://emch.com.bd/",
    email: "info@emch.com.bd",
    speciality: "Multi-specialty care + education",
    type: "Private",
    availability_status: "Open 24/7",
    about: "Established in 2003 as a private medical college with an attached hospital. Offers multi-specialty inpatient and outpatient services."
  },
  {
    id: 8,
    name: "Samorita Hospital & Medical College",
    location: "Panthapath, Dhaka",
    contact: "General contact info widely listed",
    website: null,
    speciality: "Multi-specialty care",
    type: "Private",
    availability_status: "Open 24/7",
    about: "A private tertiary hospital with medical college affiliation. Offers a variety of specialties including medicine, surgery, obstetrics & gynecology."
  },
  {
    id: 9,
    name: "Mugda Medical College & Hospital",
    location: "Hazi Kadam Ali Road, Mugda, Dhaka",
    contact: "N/A",
    website: "http://mumc.gov.bd/",
    speciality: "General and academic care",
    type: "Public",
    availability_status: "Open 24/7",
    about: "A public medical college and 500-bed hospital established in 2013. Offers educational programs (MBBS) as well as health care services."
  },
  {
    id: 10,
    name: "Evercare Hospital Dhaka",
    location: "Plot # 67, Block # F, Road # 113/A, Bashundhara R/A, Dhaka-1229",
    contact: "+880 9612-010101",
    website: "https://evercarebd.com/",
    email: "info@evercarebd.com",
    speciality: "Multi-speciality care, ICU, ER, cardiology",
    type: "Private",
    availability_status: "Open 24/7",
    about: "One of the largest tertiary private hospitals in Bangladesh (formerly Apollo Hospitals). Offers cardiology, oncology, neurology, orthopaedics, emergency care."
  },
  {
    id: 11,
    name: "Square Hospitals Ltd.",
    location: "48/1, Panthapath, Dhaka-1215",
    contact: "+880 9610-010010",
    website: "https://squarehospital.com/",
    email: "info@squarehospital.com",
    speciality: "Surgery, medicine, ICU, trauma",
    type: "Private",
    availability_status: "Open 24/7",
    about: "One of the leading private hospitals in Dhaka. Services include cardiology, neurosurgery, gastroenterology, orthopaedics, oncology."
  },
  {
    id: 12,
    name: "United Hospital Limited",
    location: "House # 15, Road # 71, Gulshan-2, Dhaka-1212",
    contact: "+880 2-9888141–50",
    website: "https://unitedhospital.com.bd/",
    email: "info@unitedhospital.com.bd",
    speciality: "Cardiac, neurology, oncology",
    type: "Private",
    availability_status: "Open 24/7",
    about: "A premier private hospital with extensive multispecialty departments. Known for cardiac care, renal services, oncology, neurology."
  },
  {
    id: 13,
    name: "Aichi Hospital Limited",
    location: "Plot # 28, Sector # 7, Uttara Model Town, Dhaka-1230",
    contact: "+880 2-48930550",
    website: "https://aicihospital.com/",
    email: "info@aicihospital.com",
    speciality: "General medicine, maternity",
    type: "Private",
    availability_status: "Open 24/7",
    about: "Private multi-specialty hospital with general medicine, surgery, ICU, maternity care, diagnostics and emergency support."
  },
  {
    id: 14,
    name: "AMZ Hospital Ltd",
    location: "Eastern Badda, Dhaka-1212",
    contact: "+880 2-9885795",
    website: null,
    speciality: "General services",
    type: "Private",
    availability_status: "Open 24/7",
    about: "Private hospital providing emergency care, general medicine, surgery, prenatal & postnatal services, lab diagnostics."
  },
  {
    id: 15,
    name: "BRB Hospital",
    location: "127/1, Dhaka-1205",
    contact: "+880-1712-345678",
    website: null,
    speciality: "Outpatient, general care",
    type: "Private",
    availability_status: "Open 24/7",
    about: "Private facility known for general medical services and outpatient care. Offers consultations across medicine, general surgery."
  },
  {
    id: 16,
    name: "Central Hospital Ltd",
    location: "82 Old Elephant Road, Dhaka-1205",
    contact: "+880 2-9666227",
    website: null,
    speciality: "ICU, emergency, diagnostics",
    type: "Private",
    availability_status: "Open 24/7",
    about: "Multi-specialty hospital with emergency services, ICU, diagnostic imaging, lab tests. Offers out-patient and in-patient services."
  },
  {
    id: 17,
    name: "Bangladesh Eye Hospital & Institute Ltd",
    location: "House # 3/A, Road # 11, Banani, Dhaka-1213",
    contact: "+880-2-9828585",
    website: null,
    speciality: "Eye care",
    type: "Private",
    availability_status: "Open 24/7",
    about: "Specialist ophthalmology hospital providing eye surgeries, consultations, cataract treatment, glaucoma treatment."
  },
  {
    id: 18,
    name: "Bangladesh ENT Hospital Ltd",
    location: "Near Green Road",
    contact: "+880-2-8613932",
    website: null,
    speciality: "ENT surgeries",
    type: "Private",
    availability_status: "Open 24/7",
    about: "Specialized ENT (Ear, Nose, Throat) treatment centre. Offers audiology tests, ear surgeries, sinus treatment."
  },
  {
    id: 19,
    name: "Al-Helal Specialized Hospital Ltd",
    location: "Dhaka central",
    contact: "Verified local contact varies",
    website: null,
    speciality: "Specialist outpatient",
    type: "Private",
    availability_status: "Open 24/7",
    about: "Private hospital providing general & specialist care with emergency support."
  },
  {
    id: 20,
    name: "Dhaka National Medical College & Hospital",
    location: "18/1, National Medical College Road, Dhaka-1205",
    contact: "+880 2-9128614",
    website: null,
    speciality: "Teaching + clinical",
    type: "Private",
    availability_status: "Open 24/7",
    about: "A medical college hospital offering tertiary care services, emergency room, internal medicine, surgery, paediatrics, and obstetrics."
  },
  {
    id: 21,
    name: "Green Life Hospital",
    location: "House-08, Road-02, Block-J, Khilgaon, Dhaka-1219",
    contact: "+880 2-222214444",
    website: "https://greenlifehospitalbd.com/",
    email: "info@greenlifehospitalbd.com",
    speciality: "Multi-speciality care",
    type: "Private",
    availability_status: "Open 24/7",
    about: "Multi-speciality private hospital with surgical, medical, ICU, maternity, and diagnostic facilities."
  },
  {
    id: 22,
    name: "Islami Bank Central Hospital",
    location: "9 Kakrail, Dhaka-1000",
    contact: "+880 2-9352455",
    website: "https://ibcbankallahhospital.com",
    email: "admin@ibchospitalbd.com",
    speciality: "General services",
    type: "Private",
    availability_status: "Open 24/7",
    about: "Provides general medical care, specialty clinics, diagnostic services, and emergency treatment."
  },
  {
    id: 23,
    name: "Islami Bank Specialized & General Hospital",
    location: "32/3, Nayapaltan, Dhaka-1000",
    contact: "+880 2-9563568",
    website: null,
    speciality: "Multi-speciality",
    type: "Private",
    availability_status: "Open 24/7",
    about: "Multi-speciality hospital offering medicine, surgery, ICU, diagnostics, and outpatient care."
  },
  {
    id: 24,
    name: "Padma General Hospital",
    location: "Banglamotor, Dhaka-1000",
    contact: "+880 2-9563452",
    website: null,
    speciality: "General medical services",
    type: "Private",
    availability_status: "Open 24/7",
    about: "General hospital with emergency, outpatient, maternity, surgery, and lab services."
  },
  {
    id: 25,
    name: "Padma Diagnostic Center",
    location: "Malibagh, Dhaka-1217",
    contact: "+880 2-48210046",
    website: null,
    speciality: "Imaging & lab tests",
    type: "Private",
    availability_status: "Open 24/7",
    about: "Diagnostic centre offering lab tests, imaging services (X-ray, ultrasound), ECG, and health screening."
  },
  {
    id: 101,
    name: "Rajshahi Medical College Hospital (RMCH)",
    location: "Medical College Road, Laxmipur, Rajshahi-6100",
    contact: "+880721-760254",
    website: null,
    speciality: "Medicine, Surgery, Cardiology, Orthopedics, Neurology, Pediatrics, Gynecology, Dermatology, Psychiatry",
    type: "Public",
    availability_status: "Open 24/7",
    about: "Facilities: ICU, Operation theater, Emergency 24/7, Ambulance, Vaccination services"
  },
  {
    id: 102,
    name: "Islami Bank Medical College Hospital",
    location: "Medical Road, Rajshahi",
    contact: "01711340582",
    website: null,
    speciality: "Cardiology, General Medicine, Surgery, Gynecology, Pediatrics",
    type: "Private",
    availability_status: "Open 24/7",
    about: "Facilities: Emergency, ICU, Ambulance service"
  },
  {
    id: 103,
    name: "Rajshahi Model Hospital",
    location: "Rajshahi",
    contact: "N/A",
    website: null,
    speciality: "Cardiology, Neurology, Orthopedics, ENT, Gynecology",
    type: "Private",
    availability_status: "Open 24/7",
    about: "Facilities: Laparoscopic surgery, Delivery unit, Ambulance"
  },
  {
    id: 104,
    name: "Ibn Sina Diagnostic & Consultation Center",
    location: "Rajshahi",
    contact: "N/A",
    website: null,
    speciality: "Medicine, Gastroenterology, Cardiology",
    type: "Private",
    availability_status: "Open 24/7",
    about: "Facilities: Emergency, Specialist consultation"
  },
  {
    id: 105,
    name: "Amana Hospital Ltd",
    location: "Rajshahi",
    contact: "N/A",
    website: null,
    speciality: "Medicine, Surgery, Orthopedics, Gynecology",
    type: "Private",
    availability_status: "Open 24/7",
    about: "Facilities: ICU, Operation theater"
  },
  {
    id: 106,
    name: "Shaheed Ziaur Rahman Medical College Hospital",
    location: "Bogura",
    contact: "N/A",
    website: null,
    speciality: "Medicine, Surgery, Pediatrics, Gynecology",
    type: "Public",
    availability_status: "Open 24/7",
    about: "Facilities: ICU, Emergency, Inpatient wards"
  },
  {
    id: 107,
    name: "Khwaja Yunus Ali Medical College Hospital",
    location: "Sirajganj",
    contact: "N/A",
    website: null,
    speciality: "Cardiology, Oncology, Nephrology, Neurology",
    type: "Private",
    availability_status: "Open 24/7",
    about: "Facilities: ICU, Emergency, Dialysis center"
  },
  {
    id: 108,
    name: "Pabna Medical College Hospital",
    location: "Pabna",
    contact: "N/A",
    website: null,
    speciality: "Medicine, Surgery, Gynecology, Pediatrics",
    type: "Public",
    availability_status: "Open 24/7",
    about: "Facilities: Emergency, Operation theater"
  },
  {
    id: 109,
    name: "Natore Sadar Hospital",
    location: "Natore",
    contact: "N/A",
    website: null,
    speciality: "General Medicine",
    type: "Public",
    availability_status: "Open 24/7",
    about: "Facilities: Emergency, Maternity services"
  },
  {
    id: 110,
    name: "Chapainawabganj Sadar Hospital",
    location: "Chapainawabganj",
    contact: "N/A",
    website: null,
    speciality: "General Medicine",
    type: "Public",
    availability_status: "Open 24/7",
    about: "Facilities: Emergency, Surgery unit"
  },
  {
    id: 111,
    name: "TMSS Medical College Hospital",
    location: "Rangpur Road, Thengamara, Bogura",
    contact: "N/A",
    website: null,
    speciality: "Medicine, Surgery, Gynecology & Obstetrics, Pediatrics, Cardiology",
    type: "Private",
    availability_status: "Open 24/7",
    about: "Facilities: ICU, Operation theater, Emergency service, Ambulance"
  },
  {
    id: 112,
    name: "Mohammad Ali Hospital",
    location: "Bogura Sadar, Bogura",
    contact: "N/A",
    website: null,
    speciality: "Medicine, Surgery, Orthopedics, Pediatrics",
    type: "Public",
    availability_status: "Open 24/7",
    about: "Facilities: Emergency, Operation theater, Inpatient ward"
  },
  {
    id: 113,
    name: "Bogura General Hospital",
    location: "Bogura",
    contact: "N/A",
    website: null,
    speciality: "Medicine, Surgery, Gynecology",
    type: "Public",
    availability_status: "Open 24/7",
    about: "Facilities: Emergency, Maternity services"
  },
  {
    id: 114,
    name: "Popular Diagnostic Center (Bogura)",
    location: "Bogura",
    contact: "N/A",
    website: null,
    speciality: "Cardiology, Gastroenterology, Neurology",
    type: "Private",
    availability_status: "Open 24/7",
    about: "Facilities: Specialist consultation, Diagnostic services"
  },
  {
    id: 115,
    name: "Naogaon Sadar Hospital",
    location: "Naogaon",
    contact: "N/A",
    website: null,
    speciality: "Medicine, Surgery, Pediatrics, Gynecology",
    type: "Public",
    availability_status: "Open 24/7",
    about: "Facilities: Emergency, Operation theater"
  },
  {
    id: 116,
    name: "Naogaon Modern Hospital",
    location: "Naogaon",
    contact: "N/A",
    website: null,
    speciality: "Medicine, Surgery, Orthopedics",
    type: "Private",
    availability_status: "Open 24/7",
    about: "Facilities: Emergency, Ambulance"
  },
  {
    id: 117,
    name: "Natore Modern Hospital",
    location: "Natore",
    contact: "N/A",
    website: null,
    speciality: "Medicine, Surgery, Gynecology",
    type: "Private",
    availability_status: "Open 24/7",
    about: "Facilities: Delivery unit, Emergency"
  },
  {
    id: 118,
    name: "Joypurhat District Hospital",
    location: "Joypurhat",
    contact: "N/A",
    website: null,
    speciality: "Medicine, Surgery, Pediatrics",
    type: "Public",
    availability_status: "Open 24/7",
    about: "Facilities: Emergency, Inpatient wards"
  },
  {
    id: 119,
    name: "Central Hospital Pabna",
    location: "Pabna",
    contact: "N/A",
    website: null,
    speciality: "Medicine, Surgery, Gynecology",
    type: "Private",
    availability_status: "Open 24/7",
    about: "Facilities: Operation theater, Ambulance"
  },
  {
    id: 120,
    name: "Green Life Hospital (Chapai Nawabganj)",
    location: "Chapai Nawabganj",
    contact: "N/A",
    website: null,
    speciality: "Medicine, Surgery, Pediatrics",
    type: "Private",
    availability_status: "Open 24/7",
    about: "Facilities: Emergency, Maternity services"
  },
  {
    id: 121,
    name: "Chittagong Medical College Hospital (CMCH)",
    location: "K.B. Fazlul Kader Road, Panchlaish, Chattogram",
    contact: "N/A",
    website: null,
    speciality: "Medicine, Surgery, Cardiology, Neurology, Pediatrics, Orthopedics, Gynecology & Obstetrics",
    type: "Public",
    availability_status: "Open 24/7",
    about: "Facilities: ICU, Operation theater, Emergency 24/7, Ambulance"
  },
  {
    id: 122,
    name: "Bangabandhu Memorial Hospital",
    location: "Agrabad Commercial Area, Chattogram",
    contact: "N/A",
    website: null,
    speciality: "Medicine, Cardiology, Orthopedics, Gynecology",
    type: "Private",
    availability_status: "Open 24/7",
    about: "Facilities: Emergency, Operation theater, Ambulance"
  },
  {
    id: 123,
    name: "Parkview Hospital Ltd",
    location: "Panchlaish, Chattogram",
    contact: "N/A",
    website: null,
    speciality: "Cardiology, Neurology, Gastroenterology, Orthopedics, Gynecology",
    type: "Private",
    availability_status: "Open 24/7",
    about: "Facilities: ICU, Emergency, Dialysis center"
  },
  {
    id: 124,
    name: "Imperial Hospital Ltd",
    location: "Zakir Hossain Road, Chattogram",
    contact: "N/A",
    website: null,
    speciality: "Cardiology, Oncology, Neurology, Pediatrics",
    type: "Private",
    availability_status: "Open 24/7",
    about: "Facilities: ICU, Emergency, Operation theater"
  },
  {
    id: 125,
    name: "Chevron Clinical Laboratory",
    location: "Mehedibag, Chattogram",
    contact: "N/A",
    website: null,
    speciality: "Pathology, Cardiology",
    type: "Private",
    availability_status: "Open 24/7",
    about: "Facilities: Diagnostic services, Specialist consultation"
  },
  {
    id: 126,
    name: "National Hospital Chattogram",
    location: "Mehedibag Road, Chattogram",
    contact: "N/A",
    website: null,
    speciality: "Medicine, Surgery, Orthopedics, Gynecology",
    type: "Private",
    availability_status: "Open 24/7",
    about: "Facilities: Emergency, Operation theater"
  },
  {
    id: 127,
    name: "Ibn Sina Diagnostic Center (Chattogram)",
    location: "Chattogram",
    contact: "N/A",
    website: null,
    speciality: "Cardiology, Medicine, Gastroenterology",
    type: "Private",
    availability_status: "Open 24/7",
    about: "Facilities: Diagnostic services, Specialist consultation"
  },
  {
    id: 128,
    name: "Chattogram General Hospital",
    location: "Anderkilla, Chattogram",
    contact: "N/A",
    website: null,
    speciality: "Medicine, Surgery, Pediatrics",
    type: "Public",
    availability_status: "Open 24/7",
    about: "Facilities: Emergency, Inpatient wards"
  },
  {
    id: 129,
    name: "Cox’s Bazar District Hospital",
    location: "Cox’s Bazar",
    contact: "N/A",
    website: null,
    speciality: "Medicine, Surgery, Pediatrics, Gynecology",
    type: "Public",
    availability_status: "Open 24/7",
    about: "Facilities: Emergency, Operation theater"
  },
  {
    id: 130,
    name: "Cox’s Bazar Medical College Hospital",
    location: "Cox’s Bazar",
    contact: "N/A",
    website: null,
    speciality: "Medicine, Surgery, Orthopedics, Gynecology",
    type: "Public",
    availability_status: "Open 24/7",
    about: "Facilities: Emergency, ICU"
  },
  {
    id: 131,
    name: "Cumilla Medical College Hospital",
    location: "Kuchaitoli, Cumilla",
    contact: "N/A",
    website: null,
    speciality: "Medicine, Surgery, Cardiology, Pediatrics, Gynecology & Obstetrics",
    type: "Public",
    availability_status: "Open 24/7",
    about: "Facilities: ICU, Emergency 24/7, Operation theater, Ambulance"
  },
  {
    id: 132,
    name: "Cumilla General Hospital (250 Bed)",
    location: "Cumilla Sadar, Cumilla",
    contact: "N/A",
    website: null,
    speciality: "Medicine, Surgery, Pediatrics, Gynecology",
    type: "Public",
    availability_status: "Open 24/7",
    about: "Facilities: Emergency, Inpatient wards"
  },
  {
    id: 133,
    name: "Moon Hospital Cumilla",
    location: "Cumilla",
    contact: "N/A",
    website: null,
    speciality: "Medicine, Surgery, Orthopedics, Gynecology",
    type: "Private",
    availability_status: "Open 24/7",
    about: "Facilities: Operation theater, Emergency"
  },
  {
    id: 134,
    name: "Feni General Hospital",
    location: "Feni Sadar, Feni",
    contact: "N/A",
    website: null,
    speciality: "Medicine, Surgery, Pediatrics, Gynecology",
    type: "Public",
    availability_status: "Open 24/7",
    about: "Facilities: Emergency, Operation theater"
  },
  {
    id: 135,
    name: "Feni Diagnostic Center",
    location: "Feni",
    contact: "N/A",
    website: null,
    speciality: "Cardiology, Medicine",
    type: "Private",
    availability_status: "Open 24/7",
    about: "Facilities: Diagnostic services, Specialist consultation"
  },
  {
    id: 136,
    name: "Noakhali General Hospital (250 Bed)",
    location: "Maijdee Court, Noakhali",
    contact: "N/A",
    website: null,
    speciality: "Medicine, Surgery, Pediatrics, Gynecology",
    type: "Public",
    availability_status: "Open 24/7",
    about: "Facilities: Emergency, Inpatient wards"
  },
  {
    id: 137,
    name: "Noakhali Medical College Hospital",
    location: "Maijdee, Noakhali",
    contact: "N/A",
    website: null,
    speciality: "Medicine, Surgery, Orthopedics, Pediatrics, Gynecology",
    type: "Public",
    availability_status: "Open 24/7",
    about: "Facilities: ICU, Emergency, Operation theater"
  },
  {
    id: 138,
    name: "Lakshmipur Sadar Hospital",
    location: "Lakshmipur",
    contact: "N/A",
    website: null,
    speciality: "Medicine, Surgery, Pediatrics",
    type: "Public",
    availability_status: "Open 24/7",
    about: "Facilities: Emergency, Maternity services"
  },
  {
    id: 139,
    name: "Rangamati General Hospital",
    location: "Rangamati",
    contact: "N/A",
    website: null,
    speciality: "Medicine, Surgery, Pediatrics",
    type: "Public",
    availability_status: "Open 24/7",
    about: "Facilities: Emergency, Inpatient wards"
  },
  {
    id: 140,
    name: "Bandarban Sadar Hospital",
    location: "Bandarban",
    contact: "N/A",
    website: null,
    speciality: "Medicine, Surgery, Pediatrics",
    type: "Public",
    availability_status: "Open 24/7",
    about: "Facilities: Emergency, Maternity services"
  },
  {
    id: 141,
    name: "Khagrachari District Sadar Hospital",
    location: "Khagrachari Sadar, Khagrachari",
    contact: "N/A",
    website: null,
    speciality: "Medicine, Surgery, Pediatrics, Gynecology",
    type: "Public",
    availability_status: "Open 24/7",
    about: "Facilities: Emergency, Inpatient wards, Maternity services"
  },
  {
    id: 142,
    name: "Chattogram Metropolitan Hospital",
    location: "Agrabad, Chattogram",
    contact: "N/A",
    website: null,
    speciality: "Medicine, Cardiology, Orthopedics, Gynecology",
    type: "Private",
    availability_status: "Open 24/7",
    about: "Facilities: Emergency, Operation theater, Ambulance"
  },
  {
    id: 143,
    name: "Epic Healthcare Chattogram",
    location: "Mehedibag Road, Chattogram",
    contact: "N/A",
    website: null,
    speciality: "Cardiology, Neurology, Gastroenterology",
    type: "Private",
    availability_status: "Open 24/7",
    about: "Facilities: ICU, Emergency, Diagnostic services"
  },
  {
    id: 144,
    name: "CSCR Hospital Ltd",
    location: "Panchlaish, Chattogram",
    contact: "N/A",
    website: null,
    speciality: "Medicine, Cardiology, Neurology, Orthopedics",
    type: "Private",
    availability_status: "Open 24/7",
    about: "Facilities: ICU, Operation theater, Emergency"
  },
  {
    id: 145,
    name: "Surgiscope Hospital Ltd",
    location: "Panchlaish, Chattogram",
    contact: "N/A",
    website: null,
    speciality: "Surgery, Orthopedics, Gynecology",
    type: "Private",
    availability_status: "Open 24/7",
    about: "Facilities: Operation theater, Emergency, Ambulance"
  },
  {
    id: 146,
    name: "People's Hospital Ltd",
    location: "Agrabad, Chattogram",
    contact: "N/A",
    website: null,
    speciality: "Medicine, Surgery, Pediatrics",
    type: "Private",
    availability_status: "Open 24/7",
    about: "Facilities: Emergency, Inpatient wards"
  },
  {
    id: 147,
    name: "Sandwip Upazila Health Complex",
    location: "Sandwip Island, Chattogram",
    contact: "N/A",
    website: null,
    speciality: "Medicine, Surgery, Pediatrics, Gynecology",
    type: "Public",
    availability_status: "Open 24/7",
    about: "Facilities: Emergency, Maternity services"
  },
  {
    id: 148,
    name: "Sitakunda Upazila Health Complex",
    location: "Sitakunda, Chattogram",
    contact: "N/A",
    website: null,
    speciality: "Medicine, Surgery, Pediatrics",
    type: "Public",
    availability_status: "Open 24/7",
    about: "Facilities: Emergency, Inpatient wards"
  },
  {
    id: 149,
    name: "Lohagara Upazila Health Complex",
    location: "Lohagara, Chattogram",
    contact: "N/A",
    website: null,
    speciality: "Medicine, Surgery, Pediatrics, Gynecology",
    type: "Public",
    availability_status: "Open 24/7",
    about: "Facilities: Emergency, Maternity services"
  },
  {
    id: 150,
    name: "Satkania Upazila Health Complex",
    location: "Satkania, Chattogram",
    contact: "N/A",
    website: null,
    speciality: "Medicine, Surgery, Pediatrics",
    type: "Public",
    availability_status: "Open 24/7",
    about: "Facilities: Emergency, Inpatient wards"
  },
  {
    id: 151,
    name: "Sylhet MAG Osmani Medical College Hospital",
    location: "Medical Road, Sylhet City",
    contact: "N/A",
    website: null,
    speciality: "Medicine, Surgery, Pathology, Microbiology, Radiology",
    type: "Public",
    availability_status: "Open 24/7",
    about: "Facilities: ICU, Burn Unit, Emergency Department, Blood bank, COVID-19 testing lab. Tests: CT Scan, MRI, X-Ray, USG, PCR."
  },
  {
    id: 152,
    name: "Ibn Sina Hospital Sylhet Ltd.",
    location: "Sobhani Ghat Point, Sylhet",
    contact: "N/A",
    website: null,
    speciality: "Multispecialty, Pathology, Radiology",
    type: "Private",
    availability_status: "Open 24/7",
    about: "Facilities: Indoor & Outdoor patient service. Tests: CT Scan, MRI, USG, ECG, Echo, PCR."
  },
  {
    id: 153,
    name: "Labaid Diagnostic Center Sylhet",
    location: "New Medical Road, Kajolshah, Sylhet",
    contact: "N/A",
    website: null,
    speciality: "Diagnostic, Pathology, Radiology",
    type: "Private",
    availability_status: "Open 24/7",
    about: "Tests: X-Ray, CT Scan, MRI, USG, ECG, Echo, ETT."
  },
  {
    id: 154,
    name: "Northeast Medical College Hospital",
    location: "South Surma, Sylhet",
    contact: "N/A",
    website: null,
    speciality: "Medicine, Surgery, Pathology, Radiology",
    type: "Private",
    availability_status: "Open 24/7",
    about: "Facilities: ICU, Operation Theater, Emergency unit. Tests: X-Ray, CT Scan, USG, ECG."
  },
  {
    id: 155,
    name: "Mount Adora Hospital",
    location: "Mirboxtula, Nayasarak, Sylhet",
    contact: "N/A",
    website: null,
    speciality: "Multispecialty, Pathology, Radiology",
    type: "Private",
    availability_status: "Open 24/7",
    about: "Facilities: ICU, CCU, NICU, PICU. Tests: CT Scan, MRI, X-Ray, ECG, USG, Echo, ETT."
  },
  {
    id: 156,
    name: "Oasis Hospital Ltd.",
    location: "Subhanighat, Sylhet",
    contact: "N/A",
    website: null,
    speciality: "Medicine, Surgery, Pathology, Radiology",
    type: "Private",
    availability_status: "Open 24/7",
    about: "Tests: CT Scan, X-Ray, USG, Dental diagnostics."
  },
  {
    id: 157,
    name: "Noorjahan Hospital Ltd.",
    location: "Dargah Gate / Shibganj, Sylhet",
    contact: "N/A",
    website: null,
    speciality: "Medicine, Surgery, Pathology, Radiology",
    type: "Private",
    availability_status: "Open 24/7",
    about: "Tests: CT Scan, ECG, USG, Laboratory tests."
  },
  {
    id: 158,
    name: "Medinova Medical Services",
    location: "Kajolshah, Sylhet",
    contact: "N/A",
    website: null,
    speciality: "Diagnostic, Pathology, Radiology",
    type: "Private",
    availability_status: "Open 24/7",
    about: "Tests: ECG, Echo, Endoscopy, Clinical laboratory investigations."
  },
  {
    id: 159,
    name: "Comfort Medical Services",
    location: "New Medical Road, Sylhet",
    contact: "N/A",
    website: null,
    speciality: "Diagnostic, Pathology, Radiology",
    type: "Private",
    availability_status: "Open 24/7",
    about: "Tests: Laboratory investigations, Pathology tests, Radiology imaging, USG, ECG."
  },
  {
    id: 160,
    name: "Sheba Poly Clinic",
    location: "Mirer Maidan, Sylhet",
    contact: "N/A",
    website: null,
    speciality: "Medicine, Pathology, Radiology",
    type: "Private",
    availability_status: "Open 24/7",
    about: "Tests: Basic pathology tests, X-Ray, Blood tests, Ultrasound."
  },
  {
    id: 161,
    name: "Parkview Medical College Hospital",
    location: "VIP Road, Sylhet",
    contact: "N/A",
    website: null,
    speciality: "Medicine, Surgery, Pathology, Radiology",
    type: "Private",
    availability_status: "Open 24/7",
    about: "Tests: CT Scan, MRI, X-Ray, USG, ECG / Echo, Endoscopy."
  },
  {
    id: 162,
    name: "Jalalabad Ragib-Rabeya Medical College Hospital",
    location: "Pathantula, Sylhet",
    contact: "N/A",
    website: null,
    speciality: "Medicine, Surgery, Pathology, Radiology",
    type: "Private",
    availability_status: "Open 24/7",
    about: "Tests: Clinical pathology, Biochemistry tests, X-Ray, USG, CT Scan."
  },
  {
    id: 163,
    name: "Sylhet Women’s Medical College Hospital",
    location: "Nayasarak, Sylhet",
    contact: "N/A",
    website: null,
    speciality: "Gynecology, Medicine, Surgery, Pathology",
    type: "Private",
    availability_status: "Open 24/7",
    about: "Tests: Blood tests, Biochemistry tests, X-Ray, USG, ECG, Pregnancy tests."
  },
  {
    id: 164,
    name: "Al Haramain Hospital Pvt. Ltd.",
    location: "Subhanighat, Sylhet",
    contact: "N/A",
    website: null,
    speciality: "Medicine, Surgery, Pathology, Radiology",
    type: "Private",
    availability_status: "Open 24/7",
    about: "Tests: Pathology laboratory, CT Scan, X-Ray, USG, ECG, Blood tests."
  },
  {
    id: 165,
    name: "Popular Medical Center & Hospital",
    location: "Subhanighat, Sylhet",
    contact: "N/A",
    website: null,
    speciality: "Medicine, Surgery, Pathology, Radiology",
    type: "Private",
    availability_status: "Open 24/7",
    about: "Tests: Pathology tests, Biochemistry tests, CT Scan, X-Ray, USG, ECG."
  },
  {
    id: 166,
    name: "Popular Medical Center",
    location: "Kajolshah, Sylhet",
    contact: "N/A",
    website: null,
    speciality: "Diagnostic, Pathology, Radiology",
    type: "Private",
    availability_status: "Open 24/7",
    about: "Tests: Blood tests, Pathology tests, X-Ray, USG, ECG."
  },
  {
    id: 167,
    name: "Sylhet Diabetic Hospital",
    location: "Puranlane Road, Sylhet",
    contact: "N/A",
    website: null,
    speciality: "Endocrinology, Diabetology, Pathology",
    type: "Private",
    availability_status: "Open 24/7",
    about: "Tests: Diabetes tests, Blood glucose testing, HbA1c test, Lipid profile, ECG."
  },
  {
    id: 168,
    name: "National Heart Foundation Hospital (Sylhet Branch)",
    location: "Tilagor, Sylhet",
    contact: "N/A",
    website: null,
    speciality: "Cardiology, Pathology",
    type: "Private",
    availability_status: "Open 24/7",
    about: "Tests: ECG, Echocardiography, Cardiac stress test (ETT), Lipid profile, Cardiac enzyme tests."
  },
  {
    id: 169,
    name: "Royal Hospital & Research Center",
    location: "Kazi Ilias Road, Sylhet",
    contact: "N/A",
    website: null,
    speciality: "Medicine, Surgery, Pathology, Radiology",
    type: "Private",
    availability_status: "Open 24/7",
    about: "Tests: Clinical pathology, CT Scan, X-Ray, USG, Blood tests."
  },
  {
    id: 170,
    name: "Mohanagar Hospital",
    location: "Dargah Moholla, Sylhet",
    contact: "N/A",
    website: null,
    speciality: "Medicine, Surgery, Pathology, Radiology",
    type: "Private",
    availability_status: "Open 24/7",
    about: "Tests: Pathology tests, X-Ray, USG, ECG."
  },
  {
    id: 171,
    name: "Brighton Hospital",
    location: "Mirabazar, Sylhet",
    contact: "N/A",
    website: null,
    speciality: "Medicine, Surgery, Pathology, Radiology",
    type: "Private",
    availability_status: "Open 24/7",
    about: "Tests: Pathology tests, Radiology imaging, USG, ECG."
  },
  {
    id: 172,
    name: "Trust Medical Services",
    location: "Sylhet City",
    contact: "N/A",
    website: null,
    speciality: "Diagnostic, Pathology, Radiology",
    type: "Private",
    availability_status: "Open 24/7",
    about: "Tests: Laboratory tests, X-Ray, USG, Blood tests."
  },
  {
    id: 173,
    name: "Health Care Hospital & Trauma Center",
    location: "Medical Road, Sylhet",
    contact: "N/A",
    website: null,
    speciality: "Traumatology, Orthopedics, Pathology, Radiology",
    type: "Private",
    availability_status: "Open 24/7",
    about: "Tests: Pathology lab, Trauma diagnostics, X-Ray, USG."
  },
  {
    id: 174,
    name: "Fair Health Hospital",
    location: "Mirer Moydan, Sylhet",
    contact: "N/A",
    website: null,
    speciality: "Medicine, Surgery, Pathology, Radiology",
    type: "Private",
    availability_status: "Open 24/7",
    about: "Tests: Blood tests, Pathology investigations, X-Ray, USG."
  },
  {
    id: 175,
    name: "Medi-Aid Diagnostic & Consultation Center",
    location: "Sylhet",
    contact: "N/A",
    website: null,
    speciality: "Diagnostic, Pathology, Radiology",
    type: "Private",
    availability_status: "Open 24/7",
    about: "Tests: Pathology tests, Biochemistry tests, X-Ray, ECG."
  },
  {
    id: 176,
    name: "Ibn Sina Diagnostic & Consultation Center",
    location: "Rikabibazar, Sylhet",
    contact: "N/A",
    website: null,
    speciality: "Diagnostic, Pathology, Radiology",
    type: "Private",
    availability_status: "Open 24/7",
    about: "Tests: Pathology lab, CT Scan, MRI, USG, ECG."
  },
  {
    id: 177,
    name: "Sylhet Shishu Clinic & General Hospital",
    location: "Upokhantho Road, Sylhet",
    contact: "N/A",
    website: null,
    speciality: "Pediatrics, General Medicine, Pathology",
    type: "Private",
    availability_status: "Open 24/7",
    about: "Tests: Pediatric pathology tests, X-Ray, Blood tests."
  },
  {
    id: 178,
    name: "Anwar General Hospital",
    location: "Chandnighat, Sylhet",
    contact: "N/A",
    website: null,
    speciality: "General Medicine, Pathology, Radiology",
    type: "Private",
    availability_status: "Open 24/7",
    about: "Tests: Pathology tests, X-Ray, USG."
  },
  {
    id: 179,
    name: "Square Hospital Sylhet (Diagnostic Center)",
    location: "Medical College Road, Sylhet",
    contact: "N/A",
    website: null,
    speciality: "Diagnostic, Pathology, Radiology",
    type: "Private",
    availability_status: "Open 24/7",
    about: "Tests: Pathology tests, CT Scan, MRI, X-Ray, USG."
  },
  {
    id: 180,
    name: "Mount Adora Hospital (Akhalia Branch)",
    location: "Akhalia, Sylhet",
    contact: "N/A",
    website: null,
    speciality: "Medicine, Surgery, Pathology, Radiology",
    type: "Private",
    availability_status: "Open 24/7",
    about: "Tests: CT Scan, MRI, X-Ray, USG, ECG, Pathology lab."
  },
  {
    id: 181,
    name: "Khulna Medical College Hospital",
    location: "Boyra, Khulna City",
    contact: "N/A",
    website: null,
    speciality: "Medicine, Surgery, Pathology, Radiology",
    type: "Public",
    availability_status: "Open 24/7",
    about: "Facilities: Emergency, ICU/CCU, Surgery. Tests: Lab tests, X-Ray, Pathology."
  },
  {
    id: 182,
    name: "Khulna 250 Bed General Hospital",
    location: "Khulna Sadar, Khulna City",
    contact: "N/A",
    website: null,
    speciality: "Medicine, Surgery, Pathology, Radiology",
    type: "Public",
    availability_status: "Open 24/7",
    about: "Facilities: Emergency, General surgery. Tests: Routine diagnostic labs, X-Ray, Pathology."
  },
  {
    id: 183,
    name: "Shaheed Shaikh Abu Naser Specialized Hospital",
    location: "Khulna City",
    contact: "N/A",
    website: null,
    speciality: "Specialized care, Pathology, Radiology",
    type: "Public",
    availability_status: "Open 24/7",
    about: "Facilities: Advanced specialist care. Tests: Diagnostic facilities."
  },
  {
    id: 184,
    name: "Khulna City Medical College & Hospital",
    location: "KDA Avenue, Khulna City",
    contact: "N/A",
    website: null,
    speciality: "Cardiology, Pediatrics, Gynecology, Surgery",
    type: "Private",
    availability_status: "Open 24/7",
    about: "Facilities: ICU, Emergency. Tests: CT/MRI, X-Ray, Lab tests."
  },
  {
    id: 185,
    name: "Gazi Medical College Hospital",
    location: "Sonadanga, Khulna",
    contact: "N/A",
    website: null,
    speciality: "Medicine, Surgery, Maternity",
    type: "Private",
    availability_status: "Open 24/7",
    about: "Facilities: ICU, Maternity care. Tests: Laboratory tests, Imaging."
  },
  {
    id: 186,
    name: "Islami Bank Hospital, Khulna",
    location: "KDA Avenue, Khulna",
    contact: "N/A",
    website: null,
    speciality: "General Medicine, Surgery",
    type: "Private",
    availability_status: "Open 24/7",
    about: "Facilities: Emergency care. Tests: Diagnostic lab, Radiology."
  },
  {
    id: 187,
    name: "Ad-Din Akij Medical College Hospital",
    location: "Boyra, Khulna",
    contact: "N/A",
    website: null,
    speciality: "Medicine, Surgery, Pathology",
    type: "Private",
    availability_status: "Open 24/7",
    about: "Facilities: Inpatient & outpatient care. Tests: Lab tests, Imaging."
  },
  {
    id: 188,
    name: "Khulna Shishu Hospital",
    location: "Shibbari More, Khulna",
    contact: "N/A",
    website: null,
    speciality: "Pediatrics",
    type: "Public",
    availability_status: "Open 24/7",
    about: "Facilities: Child healthcare. Tests: Diagnostic labs, Imaging."
  },
  {
    id: 189,
    name: "Khulna Chest Disease Hospital",
    location: "Chhoto Boyra, Khulna",
    contact: "N/A",
    website: null,
    speciality: "Respiratory care, Tuberculosis",
    type: "Public",
    availability_status: "Open 24/7",
    about: "Facilities: Respiratory care. Tests: Chest imaging, Pathology."
  },
  {
    id: 190,
    name: "Fortis Escorts Heart Institute, Khulna",
    location: "Khulna",
    contact: "N/A",
    website: null,
    speciality: "Cardiology",
    type: "Private",
    availability_status: "Open 24/7",
    about: "Facilities: Cardiac care, Surgery. Tests: ECG, Echo, Diagnostics."
  },
  {
    id: 191,
    name: "Bangladesh Eye Hospital & Laser Center",
    location: "Khulna",
    contact: "N/A",
    website: null,
    speciality: "Ophthalmology",
    type: "Private",
    availability_status: "Open 24/7",
    about: "Facilities: Eye surgery, Laser treatment. Tests: Ophthalmology diagnostics."
  },
  {
    id: 192,
    name: "Labcon Diagnostic & Consultation Center",
    location: "Khulna",
    contact: "N/A",
    website: null,
    speciality: "Diagnostic, Pathology, Radiology",
    type: "Private",
    availability_status: "Open 24/7",
    about: "Tests: Lab tests, Pathology, Imaging."
  },
  {
    id: 193,
    name: "Popular Diagnostic Center, Khulna",
    location: "Khulna",
    contact: "N/A",
    website: null,
    speciality: "Diagnostic, Pathology, Radiology",
    type: "Private",
    availability_status: "Open 24/7",
    about: "Tests: Lab tests, Imaging services."
  },
  {
    id: 194,
    name: "Best Care Clinic & Diagnostic Center",
    location: "Khulna",
    contact: "N/A",
    website: null,
    speciality: "Primary care, Diagnostic",
    type: "Private",
    availability_status: "Open 24/7",
    about: "Facilities: Primary care. Tests: Lab tests."
  },
  {
    id: 195,
    name: "Citizen Lab Doctor & Diagnostic",
    location: "Khulna",
    contact: "N/A",
    website: null,
    speciality: "Diagnostic, Pathology",
    type: "Private",
    availability_status: "Open 24/7",
    about: "Tests: Pathology, Basic imaging."
  },
  {
    id: 196,
    name: "Alif Diagnostic & Consultation Center",
    location: "Khan Jahan Ali Road, Khulna",
    contact: "N/A",
    website: null,
    speciality: "Diagnostic, Pathology",
    type: "Private",
    availability_status: "Open 24/7",
    about: "Tests: Pathology, Basic lab tests, X-Ray, Ultrasound."
  },
  {
    id: 197,
    name: "Star Diagnostic & Consultation Center",
    location: "Khulna",
    contact: "N/A",
    website: null,
    speciality: "Diagnostic, Pathology",
    type: "Private",
    availability_status: "Open 24/7",
    about: "Tests: Lab tests, Imaging."
  },
  {
    id: 198,
    name: "A Samad Memorial Hospital & Diagnostic Center",
    location: "Khulna",
    contact: "N/A",
    website: null,
    speciality: "Medicine, Diagnostic",
    type: "Private",
    availability_status: "Open 24/7",
    about: "Facilities: Hospital services. Tests: Diagnostics."
  },
  {
    id: 199,
    name: "Bangladesh Diagnostic & Consultation Center",
    location: "Shamsur Rahman Road, Khulna",
    contact: "N/A",
    website: null,
    speciality: "Diagnostic, Pathology",
    type: "Private",
    availability_status: "Open 24/7",
    about: "Tests: Lab pathology, Imaging, Basic diagnostic screening."
  },
  {
    id: 200,
    name: "Ankur Diagnostic & Health Care",
    location: "Sonadanga, Khulna",
    contact: "N/A",
    website: null,
    speciality: "Diagnostic, Pathology",
    type: "Private",
    availability_status: "Open 24/7",
    about: "Tests: Lab tests, Imaging services, Routine blood testing."
  },
  {
    id: 201,
    name: "Khulna Eye Hospital & Laser Center",
    location: "Shibbari, Khulna",
    contact: "N/A",
    website: null,
    speciality: "Ophthalmology",
    type: "Private",
    availability_status: "Open 24/7",
    about: "Facilities: Laser treatment. Tests: Eye examinations, Ophthalmic diagnostics, Imaging."
  },
  {
    id: 202,
    name: "Labaid Diagnostic Ltd - Khulna",
    location: "Khulna City",
    contact: "N/A",
    website: null,
    speciality: "Diagnostic, Pathology",
    type: "Private",
    availability_status: "Open 24/7",
    about: "Tests: Blood tests, Pathology, Imaging (X-Ray/Ultrasound), ECG."
  },
  {
    id: 203,
    name: "Prince Hospitals - Khulna",
    location: "Khulna",
    contact: "N/A",
    website: null,
    speciality: "General Medicine",
    type: "Private",
    availability_status: "Open 24/7",
    about: "Facilities: Inpatient services. Tests: Diagnostics."
  },
  {
    id: 204,
    name: "Royal Diagnostic & Consultation Limited",
    location: "Khulna",
    contact: "N/A",
    website: null,
    speciality: "Diagnostic, Pathology",
    type: "Private",
    availability_status: "Open 24/7",
    about: "Tests: Lab tests, Basic imaging, General diagnostics."
  },
  {
    id: 205,
    name: "Sandhani Clinic & Diagnostic Complex",
    location: "Khulna",
    contact: "N/A",
    website: null,
    speciality: "Diagnostic, Pathology",
    type: "Private",
    availability_status: "Open 24/7",
    about: "Tests: Pathology, Imaging services."
  },
  {
    id: 206,
    name: "Doctors Point Specialized Hospital",
    location: "Khulna",
    contact: "N/A",
    website: null,
    speciality: "General Medicine",
    type: "Private",
    availability_status: "Open 24/7",
    about: "Tests: Lab diagnostics, Imaging."
  },
  {
    id: 207,
    name: "250 Bed General Hospital - Jessore",
    location: "Jessore",
    contact: "N/A",
    website: null,
    speciality: "General Medicine",
    type: "Public",
    availability_status: "Open 24/7",
    about: "Facilities: Emergency. Tests: Pathology labs, X-Ray, Basic imaging."
  },
  {
    id: 208,
    name: "250 Bed General Hospital - Bagerhat",
    location: "Bagerhat",
    contact: "N/A",
    website: null,
    speciality: "General Medicine",
    type: "Public",
    availability_status: "Open 24/7",
    about: "Facilities: Outpatient services. Tests: Basic lab tests, Imaging."
  },
  {
    id: 209,
    name: "Satkhira Sadar Hospital",
    location: "Satkhira",
    contact: "N/A",
    website: null,
    speciality: "General Medicine",
    type: "Public",
    availability_status: "Open 24/7",
    about: "Tests: Pathology lab, X-Ray, Basic diagnostics."
  },
  {
    id: 210,
    name: "Kushtia District Hospital",
    location: "Kushtia",
    contact: "N/A",
    website: null,
    speciality: "General Medicine",
    type: "Public",
    availability_status: "Open 24/7",
    about: "Facilities: Emergency services. Tests: Lab tests, Imaging."
  },
  {
    id: 211,
    name: "Sher-e-Bangla Medical College Hospital",
    location: "Barishal City, Barishal",
    contact: "N/A",
    website: null,
    speciality: "Medicine, Surgery, Pathology, Radiology",
    type: "Public",
    availability_status: "Open 24/7",
    about: "Facilities: ICU, Emergency. Tests: Pathology, X-Ray, USG, CT, ECG/Echo."
  },
  {
    id: 212,
    name: "Barishal District Sadar Hospital",
    location: "Barishal Sadar",
    contact: "N/A",
    website: null,
    speciality: "General Medicine, Pathology",
    type: "Public",
    availability_status: "Open 24/7",
    about: "Facilities: Emergency, Outpatient. Tests: Clinical pathology, X-Ray, Ultrasound."
  },
  {
    id: 213,
    name: "Barishal Women’s Medical College Hospital",
    location: "Barishal City",
    contact: "N/A",
    website: null,
    speciality: "Maternity, Gynecology",
    type: "Private",
    availability_status: "Open 24/7",
    about: "Tests: Pathology, X-Ray, Ultrasound, ECG, Maternity tests."
  },
  {
    id: 214,
    name: "Udayan Hospital & Diagnostic Center",
    location: "Barishal",
    contact: "N/A",
    website: null,
    speciality: "Diagnostic, Pathology, Radiology",
    type: "Private",
    availability_status: "Open 24/7",
    about: "Tests: Pathology, Biochemistry, X-Ray, Ultrasound, ECG/Echo."
  },
  {
    id: 215,
    name: "Universal Hospital & Diagnostic Center",
    location: "Barishal",
    contact: "N/A",
    website: null,
    speciality: "Diagnostic, Pathology",
    type: "Private",
    availability_status: "Open 24/7",
    about: "Tests: Clinical lab tests, X-Ray, Ultrasound, ECG."
  },
  {
    id: 216,
    name: "Rahman Medical Hospital",
    location: "Barishal",
    contact: "N/A",
    website: null,
    speciality: "Medicine, Pathology, Radiology",
    type: "Private",
    availability_status: "Open 24/7",
    about: "Tests: Pathology tests, X-Ray, Ultrasound, ECG/Echo."
  },
  {
    id: 217,
    name: "Barishal Shishu Hospital",
    location: "Barishal",
    contact: "N/A",
    website: null,
    speciality: "Pediatrics",
    type: "Public",
    availability_status: "Open 24/7",
    about: "Tests: Child health lab tests, Pathology, X-Ray, Growth assessments."
  },
  {
    id: 218,
    name: "Shapla Medical Center",
    location: "Barishal City",
    contact: "N/A",
    website: null,
    speciality: "Multi-specialty",
    type: "Private",
    availability_status: "Open 24/7",
    about: "Tests: Laboratory investigations, X-Ray, Ultrasound, ECG."
  },
  {
    id: 219,
    name: "Labaid Diagnostic & Consultation Center - Barishal",
    location: "Barishal",
    contact: "N/A",
    website: null,
    speciality: "Diagnostic, Pathology, Radiology",
    type: "Private",
    availability_status: "Open 24/7",
    about: "Tests: Pathology, Biochemistry, X-Ray, Ultrasound, ECG."
  },
  {
    id: 220,
    name: "Al-Haramin Diagnostic Center",
    location: "Barishal City",
    contact: "N/A",
    website: null,
    speciality: "Diagnostic, Pathology",
    type: "Private",
    availability_status: "Open 24/7",
    about: "Tests: Pathology tests, X-Ray, Ultrasound, ECG."
  },
  {
    id: 221,
    name: "Rahat Anwar Hospital",
    location: "Band Road, Barishal City",
    contact: "+8801711-9939529",
    website: null,
    speciality: "General medicine, Surgery",
    type: "Private",
    availability_status: "Open 24/7",
    about: "Facilities: 24/7 emergency. Tests: Pathology lab, X-Ray, Basic imaging."
  },
  {
    id: 222,
    name: "Islami Bank Hospital - Barishal",
    location: "Chandmari, Barishal",
    contact: "+8801718-237662",
    website: null,
    speciality: "Internal medicine, Maternity",
    type: "Private",
    availability_status: "Open 24/7",
    about: "Facilities: Emergency services. Tests: Pathology lab, ECG."
  },
  {
    id: 223,
    name: "Barishal General Hospital",
    location: "Hospital Road, Barishal",
    contact: "+8801730-324760",
    website: null,
    speciality: "General Medicine",
    type: "Public",
    availability_status: "Open 24/7",
    about: "Facilities: Inpatient care, Emergency. Tests: Laboratory tests, X-Ray, Ultrasound."
  },
  {
    id: 224,
    name: "Arif Memorial Hospital",
    location: "Kali Bari Road, Barishal",
    contact: "+8801758-286878",
    website: null,
    speciality: "Cardiology, Orthopedics, Neurology",
    type: "Private",
    availability_status: "Open 24/7",
    about: "Facilities: Emergency services. Tests: Diagnostic lab, Imaging."
  },
  {
    id: 225,
    name: "Apollo Diagnostic Complex (Pvt) Ltd.",
    location: "135 Sadar Road, Barishal",
    contact: "+880431-2174019",
    website: null,
    speciality: "Diagnostic, Pathology",
    type: "Private",
    availability_status: "Open 24/7",
    about: "Tests: Pathology, Blood tests, Ultrasonography, Basic imaging."
  },
  {
    id: 226,
    name: "Ambia Memorial Hospital",
    location: "Bogura Road, Barishal",
    contact: "+880431-2175364",
    website: null,
    speciality: "General Medicine",
    type: "Private",
    availability_status: "Open 24/7",
    about: "Facilities: Outpatient care. Tests: Basic lab tests, Imaging."
  },
  {
    id: 227,
    name: "Fair Health Clinic",
    location: "Kalibari Road, Barishal",
    contact: "+880431-644129",
    website: null,
    speciality: "Diagnostic",
    type: "Private",
    availability_status: "Open 24/7",
    about: "Tests: Laboratory and basic diagnostics."
  },
  {
    id: 228,
    name: "Seba Clinic",
    location: "Bando Road, Barishal",
    contact: "+8801711-4652539",
    website: null,
    speciality: "Primary care",
    type: "Private",
    availability_status: "Open 24/7",
    about: "Facilities: Primary care. Tests: Basic diagnostics."
  },
  {
    id: 229,
    name: "Barishal Central Diagnostic Center Ltd",
    location: "Barishal Sadar",
    contact: "bchmcc@gmail.com",
    website: null,
    speciality: "Diagnostic, Pathology",
    type: "Private",
    availability_status: "Open 24/7",
    about: "Tests: Pathology, Clinical lab tests, Imaging (X-Ray, Ultrasound)."
  },
  {
    id: 230,
    name: "Bhola Popular Diagnostic Center",
    location: "Bhola Sadar, Bhola",
    contact: "bholapopulardiagnostic09@gmail.com",
    website: null,
    speciality: "Diagnostic, Pathology",
    type: "Private",
    availability_status: "Open 24/7",
    about: "Tests: Pathology tests, Imaging (Ultrasound)."
  },
  {
    id: 231,
    name: "Rangpur Medical College & Hospital",
    location: "Medical East Gate, Health City Road, Dhap, Rangpur",
    contact: "+880521-53881",
    website: null,
    speciality: "Medicine, Surgery, Pathology, Radiology",
    type: "Public",
    availability_status: "Open 24/7",
    about: "Facilities: ICU, Emergency. Tests: Pathology, X-Ray, Ultrasonography."
  },
  {
    id: 232,
    name: "Rangpur Community Medical College Hospital (RCMCH)",
    location: "Medical East Gate, Health City Road, Dhap, Rangpur",
    contact: "+8801711-992732",
    website: null,
    speciality: "Cardiology, Pathology, Radiology",
    type: "Private",
    availability_status: "Open 24/7",
    about: "Facilities: CCU, Cath-Lab. Tests: Pathology, X-Ray, Ultrasound."
  },
  {
    id: 233,
    name: "Prime Medical College Hospital",
    location: "Pirjabad, Badargonj Road, Rangpur",
    contact: "+8801730-033110",
    website: null,
    speciality: "Cardiology, Pathology, Radiology",
    type: "Private",
    availability_status: "Open 24/7",
    about: "Facilities: Emergency services. Tests: Clinical pathology, X-Ray, Ultrasound."
  },
  {
    id: 234,
    name: "Sadar Hospital - Rangpur",
    location: "Rangpur City",
    contact: "+880521-63043",
    website: null,
    speciality: "General Medicine, Maternity",
    type: "Public",
    availability_status: "Open 24/7",
    about: "Facilities: Emergency care. Tests: Routine lab tests, X-Ray, Ultrasound."
  },
  {
    id: 235,
    name: "Update Diagnostic",
    location: "Dhap, Jail Road, Rangpur",
    contact: "+8801971-555555",
    website: null,
    speciality: "Diagnostic, Pathology, Radiology",
    type: "Private",
    availability_status: "Open 24/7",
    about: "Tests: Pathology, Lab tests, X-Ray, Ultrasound."
  },
  {
    id: 236,
    name: "Popular Diagnostic Center - Rangpur",
    location: "77/1, Jail Road, Dhap, Rangpur",
    contact: "+8809613-787813",
    website: null,
    speciality: "Diagnostic, Pathology",
    type: "Private",
    availability_status: "Open 24/7",
    about: "Tests: Blood/pathology tests, X-Ray, Ultrasound, ECG."
  },
  {
    id: 237,
    name: "Labaid Diagnostic - Rangpur",
    location: "Jail Road, Rangpur City",
    contact: "+8801714-212524",
    website: null,
    speciality: "Diagnostic, Pathology, Radiology",
    type: "Private",
    availability_status: "Open 24/7",
    about: "Tests: Pathology, Biochemistry, X-Ray, Ultrasound, ECG."
  },
  {
    id: 238,
    name: "Health City Specialized Hospital & Diagnostic Center",
    location: "Shimultoli Road, Rangpur",
    contact: "+8801711-992732",
    website: null,
    speciality: "Diagnostic, Pathology, Radiology",
    type: "Private",
    availability_status: "Open 24/7",
    about: "Facilities: Emergency. Tests: Clinical lab tests, Radiology services."
  },
  {
    id: 239,
    name: "Good Health Hospital",
    location: "Dhap Jail Road, Rangpur",
    contact: "+8801717-974489",
    website: null,
    speciality: "General Medicine, Surgery",
    type: "Private",
    availability_status: "Open 24/7",
    about: "Tests: Lab tests, Blood work, X-Ray, Ultrasound."
  },
  {
    id: 240,
    name: "General Diagnostic Center - Rangpur",
    location: "Dhaap Jail Road, Rangpur",
    contact: "+8801773-896360",
    website: null,
    speciality: "Diagnostic, Pathology, Radiology",
    type: "Private",
    availability_status: "Open 24/7",
    about: "Tests: Pathology lab tests, X-Ray, Ultrasound."
  },
  {
    id: 241,
    name: "CMH Hospital Rangpur",
    location: "Dhap Road, Rangpur",
    contact: "+8801769-663322",
    website: null,
    speciality: "General Medicine",
    type: "Private",
    availability_status: "Open 24/7",
    about: "Facilities: Urgent care. Tests: Laboratory blood tests, X-Ray."
  },
  {
    id: 242,
    name: "Rangpur Central Hospital",
    location: "Mouchak Complex, Dhap Road, Rangpur",
    contact: "+8801737-894558",
    website: null,
    speciality: "General Medicine",
    type: "Private",
    availability_status: "Open 24/7",
    about: "Facilities: Primary care. Tests: Lab investigations, X-Ray, Ultrasound."
  },
  {
    id: 243,
    name: "Dinajpur 250-Bed General Hospital",
    location: "Dinajpur City",
    contact: "+880531-64023",
    website: null,
    speciality: "General Medicine, Maternity",
    type: "Public",
    availability_status: "Open 24/7",
    about: "Facilities: Inpatient care. Tests: Clinical laboratory, X-Ray, Ultrasonography."
  },
  {
    id: 244,
    name: "Gaibandha District Hospital",
    location: "Gaibandha City",
    contact: "+880541-61516",
    website: null,
    speciality: "General Medicine",
    type: "Public",
    availability_status: "Open 24/7",
    about: "Facilities: Emergency. Tests: Lab blood/urine tests, X-Ray, Ultrasound."
  },
  {
    id: 245,
    name: "Kurigram 250-Bed District Hospital",
    location: "Kurigram Sadar",
    contact: "+880581-61466",
    website: null,
    speciality: "General Medicine",
    type: "Public",
    availability_status: "Open 24/7",
    about: "Facilities: Emergency treatment. Tests: Routine lab tests, X-Ray."
  },
  {
    id: 246,
    name: "Nilphamari 250-Bed District Hospital",
    location: "Nilphamari City",
    contact: "+880551-61222",
    website: null,
    speciality: "General Medicine",
    type: "Public",
    availability_status: "Open 24/7",
    about: "Facilities: Emergency services. Tests: Pathology, Biochemistry, X-Ray, Ultrasound."
  },
  {
    id: 247,
    name: "Saidpur 100-Bed Hospital",
    location: "Saidpur, Nilphamari",
    contact: "+880552-672333",
    website: null,
    speciality: "General Medicine",
    type: "Public",
    availability_status: "Open 24/7",
    about: "Facilities: Emergency medicine. Tests: Clinical lab tests, X-Ray."
  },
  {
    id: 248,
    name: "Panchagarh District Hospital",
    location: "Panchagarh Sadar",
    contact: "+880568-61656",
    website: null,
    speciality: "General Medicine",
    type: "Public",
    availability_status: "Open 24/7",
    about: "Facilities: Emergency. Tests: Blood & pathology tests, X-Ray, Ultrasound."
  },
  {
    id: 249,
    name: "Thakurgaon Sadar Hospital",
    location: "Thakurgaon",
    contact: "N/A",
    website: null,
    speciality: "General Medicine",
    type: "Public",
    availability_status: "Open 24/7",
    about: "Facilities: Emergency labs. Tests: Basic diagnostics."
  },
  {
    id: 250,
    name: "Lalmonirhat General Hospital",
    location: "Lalmonirhat",
    contact: "N/A",
    website: null,
    speciality: "General Medicine",
    type: "Public",
    availability_status: "Open 24/7",
    about: "Tests: Basic diagnostic services."
  },
  {
    id: 251,
    name: "Dinajpur Medical College Hospital",
    location: "Dinajpur",
    contact: "N/A",
    website: null,
    speciality: "Medicine, Surgery, Pathology, Radiology",
    type: "Public",
    availability_status: "Open 24/7",
    about: "Tests: Full lab & X-ray services."
  }
];

export const HospitalBooking: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [nearbyHospitals, setNearbyHospitals] = useState<any[]>([]);
  const [explanation, setExplanation] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeType, setActiveType] = useState<'All' | 'Public' | 'Private' | 'Nearby'>('All');
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchHospitals(searchQuery, activeType);
  }, [activeType]);

  const fetchHospitals = async (query = '', type = activeType) => {
    if (type === 'Nearby') return; // Handled by handleNearbySearch
    
    setLoading(true);
    setError(null);
    
    // Simulate network delay for better UX
    setTimeout(() => {
      let filtered = STATIC_HOSPITALS;

      if (type !== 'All') {
        filtered = filtered.filter(h => h.type === type);
      }

      if (query) {
        const lowerQuery = query.toLowerCase();
        filtered = filtered.filter(h => 
          h.name.toLowerCase().includes(lowerQuery) || 
          h.location.toLowerCase().includes(lowerQuery) ||
          h.speciality.toLowerCase().includes(lowerQuery)
        );
      }

      setHospitals(filtered);
      setLoading(false);
    }, 500);
  };

  const handleNearbySearch = async () => {
    setLoading(true);
    setError(null);
    setExplanation('');
    setNearbyHospitals([]);
    setActiveType('Nearby');
    
    try {
      // Check if permission is already denied
      if (navigator.permissions) {
        const status = await navigator.permissions.query({ name: 'geolocation' });
        if (status.state === 'denied') {
          setError('Location access is blocked. Please enable precise location in your browser settings to find nearby hospitals.');
          setLoading(false);
          return;
        }
      }

      const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: false,
          timeout: 5000,
          maximumAge: 300000
        });
      });
      const { latitude, longitude } = pos.coords;
      setUserLocation({ lat: latitude, lng: longitude });

      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Find the 5 nearest hospitals or medical centers. Provide their names, full physical addresses, and specialities.`,
        config: {
          tools: [{ googleMaps: {} }],
          toolConfig: {
            retrievalConfig: {
              latLng: {
                latitude: latitude,
                longitude: longitude
              }
            }
          }
        },
      });

      const text = response.text || '';
      setExplanation(text);

      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      const formattedResults = chunks
        .filter((c: any) => c.maps)
        .map((c: any) => ({
          title: c.maps.title,
          address: 'View details in summary',
          speciality: 'General Medicine',
          website: null,
          uri: c.maps.uri
        }));
      
      setNearbyHospitals(formattedResults);

      if (formattedResults.length === 0) {
        setError('No nearby hospitals found via Google Maps.');
      }
    } catch (error: any) {
      console.error('Error getting location:', error);
      if (error.status === 429 || error.message?.includes('429') || error.message?.includes('quota') || error.message?.includes('RESOURCE_EXHAUSTED')) {
        setError('The AI service is currently busy or has reached its limit. Please try again in a few minutes.');
      } else {
        setError('Please enable location access to find nearby hospitals.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchHospitals(searchQuery, activeType);
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden"
      >
        <div className="p-10 border-b border-slate-50 dark:border-slate-800 bg-gradient-to-br from-indigo-50/80 dark:from-indigo-900/20 via-white dark:via-slate-900 to-transparent">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-indigo-600 rounded-[1.5rem] text-white shadow-xl shadow-indigo-600/20 ring-4 ring-indigo-50 dark:ring-indigo-900/20">
                <Building2 className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Hospital Finder</h2>
                <p className="text-lg text-slate-500 dark:text-slate-400 font-medium mt-1">Locate and visit healthcare facilities.</p>
              </div>
            </div>
            
            <div className="flex bg-slate-100/80 dark:bg-slate-800/80 backdrop-blur-sm p-1.5 rounded-[1.5rem] overflow-x-auto no-scrollbar border border-slate-200/50 dark:border-slate-700/50">
              {(['All', 'Public', 'Private', 'Nearby'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => type === 'Nearby' ? handleNearbySearch() : setActiveType(type)}
                  className={`px-6 py-3 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
                    activeType === type
                      ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm ring-1 ring-slate-200/50 dark:ring-slate-600/50'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-white/50 dark:hover:bg-slate-700/50'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
          
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1 group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, location, or speciality..."
                className="w-full pl-14 pr-6 py-5 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-[1.5rem] focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all text-lg text-slate-900 dark:text-white font-medium shadow-sm placeholder:text-slate-400"
              />
            </div>
            <Button type="submit" disabled={loading} className="rounded-[1.5rem] px-10 py-5 bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-600/20 text-lg font-bold transition-all hover:-translate-y-0.5">
              {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Search'}
            </Button>
          </form>
        </div>

        <div className="p-10">
          <AnimatePresence mode="wait">
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 bg-red-50 border border-red-100 text-red-600 rounded-3xl mb-8 flex items-start gap-4"
              >
                <AlertCircle className="w-6 h-6 mt-0.5 flex-shrink-0" />
                <p className="font-medium">{error}</p>
              </motion.div>
            )}

            {activeType === 'Nearby' ? (
              <motion.div 
                key="nearby"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-10"
              >
                {explanation && (
                  <div className="prose prose-slate max-w-none bg-slate-50/50 dark:bg-slate-900/50 p-10 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-inner dark:prose-invert">
                    <div className="markdown-body">
                      <ReactMarkdown>{explanation}</ReactMarkdown>
                    </div>
                  </div>
                )}
                
                {nearbyHospitals.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {nearbyHospitals.map((hospital, idx) => (
                      <motion.div 
                        key={idx}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="p-8 border-2 border-slate-100 dark:border-slate-800 rounded-[2rem] bg-white dark:bg-slate-900 hover:shadow-2xl hover:-translate-y-1 hover:border-indigo-200 dark:hover:border-indigo-800 transition-all duration-300 group relative overflow-hidden"
                      >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 dark:bg-indigo-900/20 rounded-full -mr-16 -mt-16 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <div className="relative z-10">
                          <div className="flex justify-between items-start mb-6">
                            <h3 className="text-2xl font-black text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors tracking-tight">{hospital.title}</h3>
                            <div className="p-2.5 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl text-indigo-600 dark:text-indigo-400 opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:scale-110">
                              <ExternalLink className="w-5 h-5" />
                            </div>
                          </div>
                          <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-wrap gap-3">
                            <a 
                              href={hospital.website || `https://www.google.com/search?q=${encodeURIComponent(hospital.title + ' official website')}`} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="flex-1 min-w-[140px]"
                            >
                              <Button className="w-full rounded-xl bg-slate-900 dark:bg-slate-800 text-white hover:bg-slate-800 dark:hover:bg-slate-700 flex items-center justify-center gap-2 py-3 text-sm font-bold transition-all shadow-md">
                                {hospital.website ? 'Website' : 'Search Website'}
                                <ExternalLink className="w-4 h-4" />
                              </Button>
                            </a>

                            <a 
                              href={hospital.uri || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(hospital.title + ' ' + (hospital.address || ''))}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-1 min-w-[140px]"
                            >
                              <Button className="w-full rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 flex items-center justify-center gap-2 py-3 text-sm font-bold transition-all shadow-lg shadow-indigo-600/20">
                                View on Location
                                <Navigation className="w-4 h-4" />
                              </Button>
                            </a>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div 
                key="list"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-8"
              >
                {hospitals.map((hospital, idx) => (
                  <motion.div 
                    key={hospital.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="p-8 border-2 border-slate-100 dark:border-slate-800 rounded-[2rem] bg-white dark:bg-slate-900 hover:shadow-2xl hover:-translate-y-1 hover:border-indigo-200 dark:hover:border-indigo-800 transition-all duration-300 group relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 dark:bg-indigo-900/20 rounded-full -mr-16 -mt-16 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="relative z-10">
                      <div className="flex justify-between items-start mb-6">
                        <div>
                          <div className="flex items-center gap-2 mb-4">
                            <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest shadow-sm ${
                              hospital.type === 'Public' 
                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 ring-1 ring-emerald-200 dark:ring-emerald-800' 
                                : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 ring-1 ring-indigo-200 dark:ring-indigo-800'
                            }`}>
                              {hospital.type}
                            </span>
                          </div>
                          <h3 className="text-2xl font-black text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors tracking-tight leading-tight">{hospital.name}</h3>
                        </div>
                      </div>
                      
                      <div className="space-y-4 mb-8">
                        <div className="flex items-center gap-4 text-slate-600 dark:text-slate-300">
                          <div className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/30 transition-colors">
                            <MapPin className="w-5 h-5 text-slate-400 dark:text-slate-500 group-hover:text-indigo-500 dark:group-hover:text-indigo-400" />
                          </div>
                          <span className="text-base font-medium">{hospital.location}</span>
                        </div>
                        <div className="flex items-center gap-4 text-slate-600 dark:text-slate-300">
                          <div className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/30 transition-colors">
                            <Phone className="w-5 h-5 text-slate-400 dark:text-slate-500 group-hover:text-indigo-500 dark:group-hover:text-indigo-400" />
                          </div>
                          <span className="text-base font-medium">{hospital.contact}</span>
                        </div>
                        <div className="flex items-start gap-4 text-slate-600 dark:text-slate-300">
                          <div className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/30 transition-colors">
                            <CheckCircle2 className="w-5 h-5 text-slate-400 dark:text-slate-500 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 mt-0.5" />
                          </div>
                          <span className="text-base font-medium leading-relaxed">{hospital.speciality}</span>
                        </div>
                        {hospital.about && (
                          <div className="flex items-start gap-4 text-slate-600 dark:text-slate-300">
                            <div className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/30 transition-colors">
                              <Info className="w-5 h-5 text-slate-400 dark:text-slate-500 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 mt-0.5" />
                            </div>
                            <span className="text-base font-medium leading-relaxed line-clamp-3">{hospital.about}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-3 pt-6 border-t border-slate-100 dark:border-slate-800">
                        <a 
                          href={hospital.website || `https://www.google.com/search?q=${encodeURIComponent(hospital.name + ' official website')}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex-1 min-w-[140px]"
                        >
                          <Button className="w-full rounded-xl bg-slate-900 dark:bg-slate-800 text-white hover:bg-slate-800 dark:hover:bg-slate-700 flex items-center justify-center gap-2 py-3 text-sm font-bold transition-all shadow-md">
                            {hospital.website ? 'Visit Website' : 'Search Website'}
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                        </a>

                        <a 
                          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(hospital.name + ' ' + hospital.location)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 min-w-[140px]"
                        >
                          <Button className="w-full rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 flex items-center justify-center gap-2 py-3 text-sm font-bold transition-all shadow-lg shadow-indigo-600/20">
                            View on Location
                            <Navigation className="w-4 h-4" />
                          </Button>
                        </a>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}

            {((activeType !== 'Nearby' && hospitals.length === 0) || (activeType === 'Nearby' && nearbyHospitals.length === 0 && !explanation)) && !loading && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-24 text-slate-400"
              >
                <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Building2 className="w-12 h-12 opacity-10" />
                </div>
                <p className="text-xl font-medium">No hospitals found.</p>
                <p className="text-slate-400 mt-2">Try adjusting your search or filters.</p>
              </motion.div>
            )}

            {loading && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-24 text-slate-500"
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full animate-pulse"></div>
                  <Loader2 className="w-16 h-16 animate-spin text-blue-600 relative z-10" />
                </div>
                <p className="mt-8 text-2xl font-black text-slate-900">Requesting Precise Location...</p>
                <p className="text-slate-500 mt-2 text-lg">Please allow location access to find the best healthcare facilities near you.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};
