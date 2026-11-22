"use strict";
// Logo shown in the header. The standalone build replaces this path with the image itself.
const LOGO = "assets/logo-mark.png";

/* ==========================================================================
   1. Data (placeholders the client can change)
   ========================================================================== */
const FIELDS={eng:"Engineering",med:"Medical",mgt:"Management",law:"Law",des:"Design",com:"Commerce"};
const LEVELS={c10:"Class 10",c12:"Class 12",grad:"Graduate"};
const TIERS=[{pts:250,pct:2},{pts:500,pct:5},{pts:1000,pct:10},{pts:2000,pct:15}];
const FEE=12000, DAILY_CAP=120;
const inr=n=>"₹"+Math.round(n).toLocaleString("en-IN");

// question bank rows: [question, right answer, wrong, wrong, wrong, why]
const QUIZ={
eng:[
["JEE Main is conducted by which agency?","NTA","UGC","AICTE","CBSE","The National Testing Agency runs JEE Main."],
["Which subjects are needed in Class 12 for BTech through JEE Main?","Physics and Maths","Biology and Chemistry","Accountancy and Economics","History and Civics","Physics and Maths are required, along with Chemistry or another approved subject."],
["JoSAA runs seat counselling for which institutes?","IITs, NITs and IIITs","Only private universities","Only medical colleges","Only law schools","One joint process covers IITs, NITs, IIITs and other centrally funded technical institutes."],
["GATE is mainly taken for what?","MTech admission and PSU jobs","Class 10 board result","MBBS admission","Law school entry","A good GATE score helps with MTech seats and some public sector recruitment."],
["How long is a regular BTech programme?","4 years","2 years","6 years","1 year","BTech is a four year degree."],
["Which body approves most technical education programmes in India?","AICTE","NMC","BCI","ICAI","AICTE is the approving body for technical programmes."]],
med:[
["Which exam decides MBBS admission in India?","NEET UG","JEE Main","CLAT","CAT","NEET UG is the single entrance exam for MBBS and BDS."],
["Which subjects are tested in NEET UG?","Physics, Chemistry, Biology","Physics, Maths, English","Accountancy, Economics, Maths","History, Civics, Geography","The paper covers Physics, Chemistry and Biology."],
["How long is MBBS including the internship?","5.5 years","3 years","2 years","7 years","4.5 years of study plus a one year compulsory internship."],
["Which body regulates medical education in India?","National Medical Commission","UGC","AICTE","ICAI","NMC sets standards and recognises medical colleges."],
["What does BDS stand for?","Bachelor of Dental Surgery","Bachelor of Data Science","Bachelor of Drug Studies","Bachelor of Design Studies","BDS is the dental degree, also admitted through NEET UG."],
["Which council regulates pharmacy education?","Pharmacy Council of India","Bar Council of India","ICSI","NID","PCI regulates pharmacy courses and registration."]],
mgt:[
["Who runs the CAT exam?","The IIMs, in rotation","NTA","UGC","CBSE","One IIM conducts CAT each year on a rotating basis."],
["How long is a standard MBA or PGDM?","2 years","6 months","5 years","10 years","Most full time MBA and PGDM programmes run for two years."],
["Who conducts CMAT?","NTA","IIT Bombay","ICAI","NID","CMAT is held by the National Testing Agency."],
["What does BBA stand for?","Bachelor of Business Administration","Bachelor of Banking Accounts","Board of Business Affairs","Bachelor of Basic Arts","BBA is the usual undergraduate route into management."],
["Which of these is an MBA specialisation?","Marketing","Anatomy","Thermodynamics","Organic Chemistry","Marketing, Finance, HR and Operations are common specialisations."],
["GMAT scores are mainly used for admission to what?","Business schools in India and abroad","Medical colleges","Law universities","Polytechnics","Many business schools accept GMAT for their MBA programmes."]],
law:[
["What does CLAT stand for?","Common Law Admission Test","Central Law Aptitude Trial","College Law Access Test","Common Legal Assessment Tool","CLAT is the common entrance for most National Law Universities."],
["How long is an integrated BA LLB after Class 12?","5 years","3 years","2 years","1 year","Integrated law degrees run for five years."],
["How long is an LLB after graduation?","3 years","5 years","1 year","6 months","The three year LLB is for students who already have a degree."],
["Which body regulates legal education and the legal profession?","Bar Council of India","NMC","AICTE","SEBI","The Bar Council of India sets rules for legal education and advocates."],
["Which university conducts AILET?","NLU Delhi","IIT Delhi","JNU","IIM Delhi","National Law University Delhi runs its own entrance test."],
["LLM is the short form of what?","Master of Laws","Licence of Legal Matters","Law and Literature Major","Legal Law Module","LLM is the postgraduate law degree."]],
des:[
["NID DAT is the entrance test of which institute?","National Institute of Design","NIT Delhi","IIM Ahmedabad","AIIMS","NID runs its own Design Aptitude Test."],
["UCEED is the entrance for B.Des at which institutes?","IITs and some other institutes","Only NITs","Only medical colleges","Only IIMs","UCEED is conducted by IIT Bombay for B.Des seats."],
["What does a design portfolio show?","Your best work and process","Your marksheet","Your fee receipts","Your ID proof","Design schools want to see how you think, not just final images."],
["Which colour model is used for screens?","RGB","CMYK","Pantone only","Greyscale only","Screens mix red, green and blue light. Print uses CMYK."],
["UX stands for what?","User Experience","Unique Extra","Universal Exchange","Urban Express","UX is about how a product feels to use."],
["Which of these is a typeface category?","Serif","Bleed","Gutter","Crop","Serif and sans serif are typeface families. The others are layout and print terms."]],
com:[
["CUET UG is conducted by whom?","NTA","ICAI","SEBI","RBI","CUET UG is used for admission to many central universities."],
["Which body conducts the CA Foundation exam?","ICAI","ICSI","NTA","UGC","The Institute of Chartered Accountants of India runs the CA course."],
["How long is a regular B.Com degree?","3 years","1 year","6 years","2 months","B.Com is a three year undergraduate degree."],
["GST stands for what?","Goods and Services Tax","General Sales Transfer","Government Savings Tax","Gross Stock Trade","GST is the indirect tax charged on goods and services."],
["A balance sheet shows what?","Assets, liabilities and equity on a date","Only profit of the year","Only salaries","Only taxes","It is a snapshot of what a business owns and owes."],
["Which institute conducts the Company Secretary course?","ICSI","ICAI","IIM","NID","The Institute of Company Secretaries of India runs CS."]],
x:[
["Which Class 11 subjects do engineering entrance exams need?","Physics, Chemistry, Maths","Accountancy, Business Studies, Economics","History, Political Science, Geography","Only languages","PCM is the usual route into engineering."],
["Which stream suits a future in medicine?","Science with Biology","Commerce","Humanities without science","Any stream","NEET needs Physics, Chemistry and Biology."],
["Accountancy is a core subject of which stream?","Commerce","Science PCM","Science PCB","Fine arts","Commerce students study Accountancy, Business Studies and Economics."],
["A diploma in engineering right after Class 10 is done at a what?","Polytechnic","Medical college","Law school","Business school","Polytechnics offer three year diplomas after Class 10."],
["Which exam do many central universities use for UG admission?","CUET UG","CAT","GATE","CLAT PG","CUET UG is taken after Class 12."],
["What should decide your Class 11 stream?","Your interests and strengths","Only what friends pick","Only the highest fee course","A coin toss","Marks matter, but interest keeps you going for years."]]
};
const MATCH={
eng:[["JEE Main","NITs and IIITs"],["JEE Advanced","IIT admission"],["GATE","MTech and PSU jobs"],["BITSAT","BITS campuses"],["JoSAA","IIT and NIT counselling"]],
med:[["NEET UG","MBBS and BDS seats"],["NEET PG","MD and MS seats"],["MCC","NEET counselling"],["NMC","Medical regulator"],["PCI","Pharmacy regulator"]],
mgt:[["CAT","IIM admission"],["XAT","XLRI and partner schools"],["CMAT","NTA exam for MBA"],["GMAT","Global business schools"],["IPMAT","Integrated MBA at IIMs"]],
law:[["CLAT","Most NLUs"],["AILET","NLU Delhi"],["BCI","Legal profession regulator"],["LLB","3 year law degree"],["BA LLB","5 year integrated degree"]],
des:[["NID DAT","NID admission"],["UCEED","B.Des at IITs"],["CEED","M.Des at IITs"],["NIFT entrance","NIFT campuses"],["Portfolio","Your work samples"]],
com:[["CUET UG","Central university UG"],["CA Foundation","Chartered Accountancy entry"],["CSEET","Company Secretary entry"],["B.Com","3 year commerce degree"],["GST","Indirect tax in India"]],
x:[["PCM","Engineering path"],["PCB","Medical path"],["Commerce","CA, CS and B.Com"],["Polytechnic","Diploma after Class 10"],["CUET","Central university entry"]]
};
const MYTHS=[
["Higher fees always mean a better college.",false,"Check placements, faculty and approvals. Fee alone says very little."],
["You can apply to many colleges at the same time.",true,"Applying widely is normal. Just track each last date."],
["Scholarships are only for toppers.",false,"Many scholarships are based on need, category or a specific talent."],
["In counselling rounds you can often freeze or float a seat.",true,"Several counselling systems let you hold a seat or try for a better one."],
["Approval from UGC or AICTE matters before you pay.",true,"Always check the approval status first."],
["Paying the seat fee early guarantees the branch you want.",false,"Your rank and the round decide the branch, not how early you pay."],
["You can check your documents after you get admission.",false,"Verify documents before the last date. A missing paper can cancel a seat."],
["Cut-offs stay exactly the same every year.",false,"Cut-offs move with the number of applicants and seats."],
["A recognised university can offer a valid online degree.",true,"UGC permits approved universities to run online programmes."],
["The last date to apply is flexible.",false,"Most deadlines are final. Do not count on an extension."]
];
const CAREER=[
["It is a free Saturday. What sounds best?",["Build or repair something","B"],["Help a friend feel better","H"],["Organise an event for everyone","L"],["Sketch, edit a video, redo your room","M"]],
["Which news story would you read to the end?",["A new gadget launch","B"],["A breakthrough treatment","H"],["A landmark court case","A"],["How a brand grew from nothing","P"]],
["In a debate you would most likely...",["Argue with facts and rules","A"],["Spot the numbers that do not add up","P"],["Rally the team behind one idea","L"],["Design the poster for it","M"]],
["Which subject felt least like work?",["Maths or Physics","B"],["Biology","H"],["Economics or Accounts","P"],["Art or computer graphics","M"]],
["What should people say about you in ten years?",["She built something that works","B"],["He helped me when I needed it","H"],["They led us well","L"],["She stood up for me","A"]],
["Pick a Monday.",["Solving a hard bug","B"],["Meeting patients","H"],["Preparing a case","A"],["Finishing a design","M"]]
];
const TYPES={B:["The Builder","eng","You like making things work. Engineering and technology fit you."],H:["The Healer","med","You care about people first. Medical and allied health fit you."],L:["The Leader","mgt","You like bringing people together. Management fits you."],A:["The Advocate","law","You like fairness and good arguments. Law fits you."],M:["The Maker","des","You think in shapes and stories. Design fits you."],P:["The Planner","com","You like order and numbers. Commerce and finance fit you."]};

