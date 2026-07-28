export const sessions = [
  ["CSR-E72E19D4","CSB-SKA-20240521","Alamshahi Family","YTM4MgQ4hldPaVUEYpP_doVqjVnWrgLBtzGGn1fLxTg="],
  ["CSR-C4D7EAD1","CSB-HARRIS-20240614","Harris Family","Z1yVXYWSs9500GmJ97vL85LXBcfd-vKRfGTIHPI4EU4="],
  ["CSR-6F6FD98A","CSB-GRINAGE-20251215","Grinage Family","A_d3NCPoDuIbGkgwlZ64I5B_K2dMLH9fWgZkyxoI7Hc="],
  ["CSR-66CC83CA","CSB-JAROD-20240515","Jarod Tait","fDgfd5BF5OfTQ6kgOl9wI0Dpv-Eekitg85C29w41EEo="],
  ["CSR-0463599D","CSB-JASON-20240513","Jason Alabanza","Rpg6y8i-qs-piFD0Y9JK43EL--k-Giy8NPWw7-TRTas="],
  ["CSR-F676A538","CSB-TAMIEKA-20240828","Tamieka Gilbert Family","IpDPwYM8fKAL_WM7cajTA_5z8eozTQYZO2W3-9A4Fyo="],
  ["CSR-6E04EA12","CSB-BERENICE-20240517","Berenice Caruthers","sA2Ad22t39ew2HkvQwpqAXB8PT9HkDyOLhRsBSVoJGk="],
  ["CSR-D67278C0","CSB-JASMINE-20240918","Jasmine Caruthers","s7aLYJ0e1DFU1mj0ag4-t1DyWMvw4rxuW6tMsGVVLD0="],
  ["CSR-D1C2A49B","CSB-MURDOCK-20260111","Murdock Family","Ej7h0kRisOLPA3G6gDYjx70GoCsh2U15ts2_znUHqEU="],
  ["CSR-BEB05C42","CSB-COTSOPOULOS-20241209","Cotsopoulos Family","jVgdhAw6esCW4myBB5qxNXr5U6SXWoeGvelpkFKA1fc="],
  ["CSR-EC395F92","CSB-MCCAIN-20250204","Geoffrey and Alessia McCain","kd9jkJoo2-fobkvlemnncvSU4bq4QVhOwQna0ZZfojU="],
  ["CSR-531531C8","CSB-STARKS-20240917","Starks Family","OQI2P3j-t4p4BjeQj1-24E7BYInfJYrWw4bHFZoX9wQ="]
].map(([sessionId,snapshotId,household,tokenHash]) => ({
  "Session ID":sessionId,"Snapshot ID":snapshotId,Household:household,"Token Hash":tokenHash,
  "Expires At":"2026-10-21T23:59:59.000Z",Status:"Active","Created At":"2026-07-22T12:00:00.000Z"
}));

export const snapshots = [
  ["CSB-SKA-20240521","Alamshahi Family",40900,20017,20883,"Historical baseline calculated - needs validation",
    {housing:7600,utilities:1600,food_household:1600,auto_payment:752,fuel_maintenance:700,auto_insurance:380,medical_dental_vision:600,debt_payments:550,other_recurring:6235},
    {checking:40000,brokerage:200000,retirement:334000,home_equity:455000},{auto_loans:36836,student_loans:70000,mortgage:966000},
    {priority_goal:"Family planning, retirement, home and business-purchase goals - validate priority order",target_monthly_savings:0,debt_payoff_target:0},
    "FNA listed employer/group and supplemental coverage. Verify current individual life, disability, and beneficiary protection."],
  ["CSB-HARRIS-20240614","Harris Family",10900,0,0,"Historical baseline incomplete - needs validation",
    {life_insurance:130},{retirement:293500},{mortgage:390000},
    {priority_goal:"Retirement around age 65 and college-savings priorities - validate amounts and timing",target_monthly_savings:0,debt_payoff_target:0},
    "FNA listed existing whole-life coverage and a monthly premium. Verify current in-force coverage, beneficiaries, and protection needs."],
  ["CSB-MURDOCK-20260111","Murdock Family",16501,9906,6595,"Historical baseline calculated - needs validation",
    {housing:3300,utilities:1020,food_household:2366,childcare_support:100,auto_payment:950,fuel_maintenance:220,auto_insurance:500,life_insurance:42,debt_payments:400,other_recurring:1008},
    {retirement:60200,primary_home_value:725000},{mortgage:450000,second_home_mortgage:70000,auto_loans:58000,credit_cards:1000,student_loans:50000,personal_loans:50000},
    {priorities:["Early retirement","Purchase business","College fund","Vacation home purchase","Medical needs"]},
    "FNA lists employer group-term coverage of $500,000 and $287,000; the second record lists a $42 monthly premium."],
  ["CSB-COTSOPOULOS-20241209","Cotsopoulos Family",9805,9154,651,"Historical baseline calculated - needs validation",
    {housing:2734,food_household:750,auto_payment:2959,fuel_maintenance:500,auto_insurance:485,medical_dental_vision:256,debt_payments:1000,other_recurring:470},
    {brokerage:8000,retirement:1000,primary_home_value:175000},{mortgage:117000,auto_loans:144000,student_loans:10,personal_loans:5314},
    {priorities:["Retirement readiness","Education funding","Emergency reserves","Debt sequencing"]},
    "The FNA listed group term coverage without face amounts, premiums, or carrier detail."],
  ["CSB-GRINAGE-20251215","Grinage Family",8000,7708.9,291.1,"Historical baseline calculated - needs validation",
    {housing:2573,utilities:745,food_household:550,childcare_support:216,auto_payment:650,fuel_maintenance:280,auto_insurance:548,medical_dental_vision:30,life_insurance:891.9,debt_payments:735,other_recurring:490},
    {money_market:23627,savings:2000,primary_home_value:245000},{mortgage:200793,auto_loans:15285,credit_cards:14621,personal_loans:968},
    {priorities:["Trust review","Retirement income","Emergency reserves","Debt sequencing"]},
    "Known IUL, accidental-death, and term coverage should be verified against current carrier records."],
  ["CSB-JAROD-20240515","Jarod Tait",6600,6880,-280,"Historical baseline calculated - needs validation",
    {housing:1700,food_household:600,auto_payment:500,fuel_maintenance:400,auto_insurance:250,debt_payments:2000,other_recurring:1430},
    {cash:5000,retirement:565000,primary_home_value:900000,rental_property_interests:225000},{mortgage:220000,other_reported_debt:20000},
    {priorities:["Retirement transition","Work flexibility","Travel","Real-estate cash flow"]},
    "Employer-paid group term coverage of $250,000 was reported; verify current coverage, portability, and beneficiaries."],
  ["CSB-JASON-20240513","Jason Alabanza",17476,14479,2997,"Historical baseline calculated - needs validation",
    {housing:7487,auto_payment:1022,life_insurance:100,other_recurring:5870},
    {cash:175000,retirement:625073,brokerage:35000,real_estate_value:1250000},{mortgage:950000,other_reported_debt:29000},
    {priorities:["Retire by 65","Become debt-free","Pass real estate to heirs","Build liquidity"]},
    "New York Life 20-year term coverage of $125,000 at $100 per month was reported historically."],
  ["CSB-TAMIEKA-20240828","Tamieka Gilbert Family",4622,4620,2,"Historical baseline calculated - needs validation",
    {housing:1483,utilities:425,food_household:500,childcare_support:1039,auto_payment:454,fuel_maintenance:220,auto_insurance:139,life_insurance:15,debt_payments:320,other_recurring:25},
    {retirement:28600,savings:3000,primary_home_value:320000},{mortgage:235000,auto_loans:26000,credit_cards:3800,student_loans:61000},
    {priorities:["Emergency reserves","Debt-free retirement","Education funding for Caidyn"]},
    "State Farm whole-life coverage of $50,000 at $15 per month was reported. Verify cash value versus any policy loan."],
  ["CSB-BERENICE-20240517","Berenice Caruthers",0,0,0,"Historical baseline incomplete - needs validation",{}, {}, {}, {},
    "Historical FNA was located, but it does not contain a reliable complete cash-flow baseline. Build a current baseline before calculating GOPPI."],
  ["CSB-MCCAIN-20250204","Geoffrey and Alessia McCain",0,0,0,"Historical baseline incomplete - needs validation",{}, {}, {}, {priorities:["Joint household planning","Home down payment","Beneficiary review"]},
    "Historical FNA was located, but it does not contain a reliable complete cash-flow baseline. Build a current baseline before calculating GOPPI."],
  ["CSB-STARKS-20240917","Starks Family",0,0,0,"Historical baseline incomplete - needs validation",{}, {retirement:25000}, {}, {},
    "Historical FNA was located, but it does not contain a reliable complete cash-flow baseline. Build a current baseline before calculating GOPPI."],
  ["CSB-JASMINE-20240918","Jasmine Caruthers",0,0,0,"Historical baseline incomplete - needs validation",{}, {}, {}, {},
    "Historical FNA was located, but it does not contain a reliable complete cash-flow baseline. Build a current baseline before calculating GOPPI."]
].map(([id,household,income,expenses,goppi,state,categories,assets,liabilities,goals,protection]) => ({
  "Snapshot ID":id,Household:household,"Monthly Household Income":income,"Monthly Expenses":expenses,"Historical GOPPI":goppi,
  "Snapshot State":state,"Expense Categories JSON":JSON.stringify(categories),"Assets JSON":JSON.stringify(assets),
  "Liabilities JSON":JSON.stringify(liabilities),"Goals JSON":JSON.stringify(goals),"Protection Notes":protection,
  "Advisor Review Summary":state.includes("incomplete")
    ? "Historical FNA captured only a partial baseline. Confirm current household income and expenses before calculating GOPPI."
    : "Historical baseline calculated from the FNA as recorded. Confirm every value with the client before relying on the score or recommendations."
}));

export const coverage = [
  ["COV-ALAM-KANESHKA-MOO","CSB-SKA-20240521","Kaneshka Alamshahi","Indexed universal life","United of Omaha / Mutual of Omaha","Current TouchPoint policy - issued policy reviewed",300000,262.5,0,"BU4745523","7/11/2024",3150,"Issued policy document reviewed"],
  ["COV-ALAM-SARAH-TA","CSB-SKA-20240521","Sarah Danai","Indexed universal life","Transamerica","Current TouchPoint policy - advisor confirmed; verify carrier record",300000,262.5,0,"","",3150,"Advisor-confirmed current carrier; illustration reviewed"],
  ["COV-HARRIS-GEORGIA-AMERICO","CSB-HARRIS-20240614","Georgia Harris","Indexed universal life","Americo Financial Life and Annuity","Current TouchPoint policy - annual statement verified",170247,100,724.63,"AM02057261","",1200,"2025 carrier annual statement reviewed"],
  ["COV-HARRIS-MICHAEL-AMERICO","CSB-HARRIS-20240614","Michael Harris","Indexed universal life","Americo Financial Life and Annuity","Current TouchPoint policy - annual statement verified",145264,100,715.91,"AM02057275","",1200,"2025 carrier annual statement reviewed"],
  ["COV-GRINAGE-BEN-AMERICO","CSB-GRINAGE-20251215","Benjamin Grinage","Indexed universal life","Americo","Reported historical coverage",286907,500,0,"","",6000,"Historical FNA schedule - current status unverified"],
  ["COV-GRINAGE-KENYA-AMERICO","CSB-GRINAGE-20251215","Kenya Grinage","Indexed universal life","Americo","Reported historical coverage",450000,323,0,"","",3876,"Historical FNA schedule - current status unverified"],
  ["COV-GRINAGE-ADND-NFCU","CSB-GRINAGE-20251215","Household","Accidental death and dismemberment","Navy Federal Credit Union","Reported historical coverage",100000,16,0,"","",192,"Historical FNA schedule - current status unverified"],
  ["COV-GRINAGE-TERM-NFCU","CSB-GRINAGE-20251215","Household","Term life","Navy Federal Credit Union","Reported historical coverage",30000,52.9,0,"","",634.8,"Historical FNA schedule - current status unverified"],
  ["COV-JAROD-GROUP-TERM","CSB-JAROD-20240515","Jarod Tait","Group term life","Employer plan","Reported historical coverage",250000,0,0,"","",0,"Historical FNA - current status unverified"],
  ["COV-JASON-NYL-TERM","CSB-JASON-20240513","Jason Alabanza","Term life","New York Life","Reported historical coverage",125000,100,0,"","",1200,"Historical FNA - current status unverified"],
  ["COV-TAMIEKA-STATEFARM-WL","CSB-TAMIEKA-20240828","Tamieka Gilbert","Whole life","State Farm","Reported historical coverage",50000,15,0,"","",180,"Historical FNA - current status unverified"],
  ["COV-MURDOCK-NIKOLAS-GROUP","CSB-MURDOCK-20260111","Nikolas Murdock","Group term life","Employer plan","Reported historical coverage",500000,0,0,"","",0,"Historical FNA schedule - current status unverified"],
  ["COV-MURDOCK-MARILEN-GROUP","CSB-MURDOCK-20260111","Marilen Murdock","Group term life","Employer plan","Reported historical coverage",287000,42,0,"","",504,"Historical FNA schedule - current status unverified"]
].map(([id,snapshotId,insured,type,carrier,status,face,premium,cashValue,policyNumber,issueDate,annualPremium,confidence]) => ({
  "Coverage ID":id,"Snapshot ID":snapshotId,"Insured / Household":insured,"Coverage Type":type,Carrier:carrier,
  "Coverage Status":status,"Face Amount":face,"Monthly Premium":premium,"Cash Value":cashValue,"Policy Number":policyNumber,
  "Issue Date":issueDate,"Annual Premium":annualPremium,"CSP Review Include":"Y","Verification Status":"Verify during annual review",
  "Source Confidence":confidence,"Coverage Notes":"Confirm current in-force status, beneficiaries, ownership, premium sufficiency, and carrier values."
}));
