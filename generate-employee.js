// file: generateEmployees.js
const fs = require("fs");
const { faker } = require("@faker-js/faker");

const employees = [];

for (let i = 1; i <= 100; i++) {
  employees.push({
    id: i,
    username: faker.internet.username(),
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    email: faker.internet.email(),
    birthDate: faker.date.birthdate({ min: 20, max: 60, mode: "age" }).toISOString(),
    basicSalary: faker.number.float({ min: 3000, max: 15000, precision: 0.01 }),
    status: faker.helpers.arrayElement(["Active", "Inactive", "Probation", "Contract"]),
    group: faker.helpers.arrayElement(["Engineering", "Design", "HR", "Finance", "Marketing", "Sales"]),
    description: faker.date.recent({ days: 1000 }).toISOString(),
  });
}

const data = { employees };

fs.writeFileSync("employees_dummy.json", JSON.stringify(data, null, 2));
console.log("✅ 100 employees generated into employees_dummy.json");