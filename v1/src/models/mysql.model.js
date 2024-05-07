const models = {
  myProfile: `
        CREATE TABLE IF NOT EXISTS users
        (
            id int auto_increment primary key,
            username varchar(20),
            password text,
            firstname varchar(20),
            lastname varchar(20),
            email varchar(50),
            companyName varchar(30),
            agencyName varchar(50),
            contactNo varchar(15),
            createdAt timestamp,
            updatedAt timestamp,
            isAdmin int,
            role varchar(10),
            addRule int,
            editRule int,
            viewRule int,
            image text,
            BRN varchar(50),
            whatsapp varchar(15),
            bio varchar(300),
            linkedin varchar(300),
            instagram varchar(300)
        );        
    `,
};

module.exports = models;
