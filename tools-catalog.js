/* =====================================================================
   tools-catalog.js — the shared tool catalogue.
   Loaded on both index.html (the tool grid) and account.html (favourites
   / recent tools), so it lives here once rather than in tools.js, and
   attaches to window so account.js (an ES module) can read it too.
   ===================================================================== */

/* ---------- 1. Catalogue ---------- */
/* available:true tools have a matching entry in RENDERERS below.
   Everything else renders as a "Coming soon" card automatically. */

window.TOOLS = [
  // ---- Student Tools ----
  { id:'assignment-tracker',        name:'Assignment Tracker',          category:'student', blurb:'Track every assignment, its due date and how close you are to done.', available:true, renderer:'assignmentTracker' },
  { id:'homework-planner',          name:'Homework Planner',            category:'student', blurb:'Lay out tonight\u2019s homework across every subject in one place.' },
  { id:'study-planner',             name:'Study Planner',               category:'student', blurb:'Block out study sessions for the week ahead by subject.' },
  { id:'revision-timetable',        name:'Revision Timetable Generator',category:'student', blurb:'Auto-build a revision timetable from your exam dates.' },
  { id:'exam-countdown',            name:'Exam Countdown',              category:'student', blurb:'A running countdown to your next exam, always in view.' },
  { id:'assessment-calendar',       name:'Assessment Calendar',         category:'student', blurb:'See every upcoming assessment across all subjects on one calendar.' },
  { id:'study-session-timer',       name:'Study Session Timer',         category:'student', blurb:'Time focused study blocks and log how long you actually studied.' },
  { id:'pomodoro-timer-student',    name:'Pomodoro Timer',              category:'student', blurb:'Work in focused 25-minute sprints with short breaks between.', available:true, renderer:'pomodoroTimer' },
  { id:'reading-log',               name:'Reading Log',                 category:'student', blurb:'Log what you\u2019re reading for class and track your progress.' },
  { id:'book-review-organiser',     name:'Book Review Organiser',       category:'student', blurb:'Keep your book reviews and ratings organised in one spot.' },
  { id:'subject-progress-tracker',  name:'Subject Progress Tracker',    category:'student', blurb:'See at a glance how you\u2019re tracking in every subject.' },
  { id:'grade-calculator',          name:'Grade Calculator',            category:'student', blurb:'Work out your overall grade from weighted assessment scores.', available:true, renderer:'gradeCalculator' },
  { id:'attendance-calculator',     name:'Attendance Calculator',       category:'student', blurb:'Work out your attendance percentage and what you can afford to miss.' },
  { id:'goal-tracker-student',      name:'Goal Tracker',                category:'student', blurb:'Set academic goals and track how close you are to hitting them.' },
  { id:'habit-tracker-student',     name:'Habit Tracker',               category:'student', blurb:'Build good study habits by tracking a daily streak.' },
  { id:'flashcard-creator',         name:'Flashcard Creator',           category:'student', blurb:'Build digital flashcard decks for quick revision.' },
  { id:'note-organiser',            name:'Note Organiser',              category:'student', blurb:'Keep class notes sorted by subject and topic.' },
  { id:'school-holiday-countdown',  name:'School Holiday Countdown',    category:'student', blurb:'Count down the school days left until the holidays.' },
  { id:'study-streak-tracker',      name:'Study Streak Tracker',        category:'student', blurb:'Track consecutive days studied and keep the streak alive.' },

  // ---- Business Tools ----
  { id:'quote-calculator',          name:'Quote Calculator',            category:'business', blurb:'Build a customer quote from line items in seconds.' },
  { id:'invoice-generator',         name:'Invoice Generator',           category:'business', blurb:'Create a clean, printable invoice with line items and totals.', available:true, renderer:'invoiceGenerator' },
  { id:'expense-tracker',           name:'Expense Tracker',             category:'business', blurb:'Log business expenses and see totals by category.', available:true, renderer:'expenseTracker' },
  { id:'revenue-tracker',           name:'Revenue Tracker',             category:'business', blurb:'Track incoming revenue against your monthly targets.' },
  { id:'profit-calculator',         name:'Profit Calculator',           category:'business', blurb:'Work out margin and profit from cost and sale price.' },
  { id:'appointment-scheduler',     name:'Appointment Scheduler',       category:'business', blurb:'Keep upcoming client appointments in one simple list.' },
  { id:'customer-database',         name:'Customer Database',           category:'business', blurb:'A lightweight place to keep customer details and notes.' },
  { id:'contact-manager',           name:'Contact Manager',             category:'business', blurb:'Manage business contacts without a bloated CRM.' },
  { id:'inventory-tracker',         name:'Inventory Tracker',           category:'business', blurb:'Track stock levels and get a heads-up on low inventory.' },
  { id:'sales-tracker',             name:'Sales Tracker',               category:'business', blurb:'Log sales and see how the week or month is tracking.' },
  { id:'subscription-tracker',      name:'Subscription Tracker',        category:'business', blurb:'Keep tabs on recurring subscriptions and renewal dates.' },
  { id:'staff-hours-calculator',    name:'Staff Hours Calculator',      category:'business', blurb:'Calculate staff hours and wages from clock in/out times.' },
  { id:'project-tracker-business',  name:'Project Tracker',             category:'business', blurb:'Track client projects from kickoff through to delivery.' },
  { id:'service-pricing-calculator',name:'Service Pricing Calculator',  category:'business', blurb:'Price a service based on time, materials and margin.' },
  { id:'break-even-calculator',     name:'Break-Even Calculator',       category:'business', blurb:'Find out how many sales you need to cover your costs.' },
  { id:'cash-flow-tracker',         name:'Cash Flow Tracker',           category:'business', blurb:'See money in versus money out over time.' },
  { id:'business-goal-tracker',     name:'Business Goal Tracker',       category:'business', blurb:'Set business goals and track progress toward each one.' },
  { id:'client-portal',             name:'Client Portal',               category:'business', blurb:'A simple shared space for client updates and files.' },

  // ---- Productivity Tools ----
  { id:'to-do-list',                name:'To-Do List',                  category:'productivity', blurb:'A clean, no-fuss to-do list that remembers what you\u2019ve done.', available:true, renderer:'todoList' },
  { id:'daily-planner',             name:'Daily Planner',               category:'productivity', blurb:'Plan today hour by hour, task by task.' },
  { id:'weekly-planner',            name:'Weekly Planner',              category:'productivity', blurb:'Lay your whole week out across one view.' },
  { id:'monthly-planner',           name:'Monthly Planner',             category:'productivity', blurb:'Zoom out and plan a full month at a glance.' },
  { id:'time-blocking-planner',     name:'Time Blocking Planner',       category:'productivity', blurb:'Block out your calendar in focused chunks of time.' },
  { id:'focus-timer',               name:'Focus Timer',                 category:'productivity', blurb:'A simple countdown timer for distraction-free work blocks.' },
  { id:'pomodoro-timer-productivity',name:'Pomodoro Timer',             category:'productivity', blurb:'Work in focused 25-minute sprints with short breaks between.', available:true, renderer:'pomodoroTimer' },
  { id:'goal-tracker-productivity', name:'Goal Tracker',                category:'productivity', blurb:'Set personal goals and track progress toward each one.' },
  { id:'habit-tracker-productivity',name:'Habit Tracker',               category:'productivity', blurb:'Track daily habits and build streaks that stick.' },
  { id:'streak-tracker',            name:'Streak Tracker',              category:'productivity', blurb:'Keep an eye on your current streak across any routine.' },
  { id:'project-tracker-productivity',name:'Project Tracker',           category:'productivity', blurb:'Break personal projects into tasks and track them to done.' },
  { id:'task-priority-matrix',      name:'Task Priority Matrix',        category:'productivity', blurb:'Sort tasks by urgent/important using the classic 2x2 matrix.' },
  { id:'meeting-notes-tool',        name:'Meeting Notes Tool',          category:'productivity', blurb:'Capture meeting notes and action items in one template.' },
  { id:'brain-dump-organiser',      name:'Brain Dump Organiser',        category:'productivity', blurb:'Get everything out of your head, then sort it after.' },
  { id:'decision-matrix',           name:'Decision Matrix',             category:'productivity', blurb:'Weigh options against criteria to make a tricky call.' },
  { id:'progress-tracker',          name:'Progress Tracker',            category:'productivity', blurb:'Track progress toward any target, big or small.' },
  { id:'calendar-planner',          name:'Calendar Planner',            category:'productivity', blurb:'Plan events and deadlines across a full calendar view.' },
  { id:'routine-builder',           name:'Routine Builder',             category:'productivity', blurb:'Design a morning, evening or workday routine step by step.' },
  { id:'workload-planner',          name:'Workload Planner',            category:'productivity', blurb:'Spread tasks across the week so no day is overloaded.' },
];

window.CATEGORY_LABEL = { student:'STUDENT', business:'BUSINESS', productivity:'PRODUCTIVITY' };
