"use strict";

const { v4: uuidv4 } = require("uuid");
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      "StudentAnswerDrafts",
      [
        // Speaking
        {
          ID: uuidv4(),
          StudentID: "c2756352-6db3-4ed3-9a6d-eed04a6bd757",
          TopicID: "ef6b69aa-2ec2-4c65-bf48-294fd12e13fc",
          QuestionID: "5ac40de4-f763-4080-bf97-36e65f66b997",
          AnswerText: null,
          AnswerAudio:
            "https://res.cloudinary.com/dlhcg0tcz/image/upload/v1742958343/greenprep/SpeakingImg/3.png",
          createdAt: new Date(),
          updatedAt: new Date(),
        },

        // Multiple choice
        {
          ID: uuidv4(),
          StudentID: "c2756352-6db3-4ed3-9a6d-eed04a6bd757",
          TopicID: "ef6b69aa-2ec2-4c65-bf48-294fd12e13fc",
          QuestionID: "30764fd2-ecc5-4810-a766-8f25d34c5748",
          AnswerText: "11 p.m",
          AnswerAudio: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },

        // Matching
        {
          ID: uuidv4(),
          StudentID: "c2756352-6db3-4ed3-9a6d-eed04a6bd757",
          TopicID: "ef6b69aa-2ec2-4c65-bf48-294fd12e13fc",
          QuestionID: "2963a0cb-d632-4ddd-a386-a820196c275b",
          AnswerText: JSON.stringify([
            {
              left: "The witness's testimony was ____ and helped to build the case.",
              right: "creative",
            },
            {
              left: "The artist was known for her ____ and unique paintings.",
              right: "credible",
            },
            {
              left: "She was a ____ nurse and always put her patients first.",
              right: "compassionate",
            },
            {
              left: "The garden was ____ with a variety of exotic plants.",
              right: "cultivated",
            },
            {
              left: "He was able to explain the concept in a ____ and clear manner.",
              right: "concise",
            },
          ]),
          AnswerAudio:
            "https://res.cloudinary.com/dlhcg0tcz/image/upload/v1742958343/greenprep/SpeakingImg/3.png",
          createdAt: new Date(),
          updatedAt: new Date(),
        },

        // Ordering
        {
          ID: uuidv4(),
          StudentID: "c2756352-6db3-4ed3-9a6d-eed04a6bd757",
          TopicID: "ef6b69aa-2ec2-4c65-bf48-294fd12e13fc",
          QuestionID: "ffac9739-edf5-427f-8ac5-3427fb878c74",
          AnswerText: JSON.stringify([
            {
              key: "A. After he finishes, there will be time for questions.",
              value: 5,
            },
            {
              key: "B. A staff member will note this down and give you a welcome pack",
              value: 2,
            },
            {
              key: "C. If you would like to attend his talk, it will take place in the main hall at midday",
              value: 4,
            },
            {
              key: "D. When you arrive at the conference hall, give your booking number.",
              value: 1,
            },
            {
              key: "E. Inside, you will find a schedule of events and the information of the key speaker",
              value: 3,
            },
          ]),
          AnswerAudio:
            "https://res.cloudinary.com/dlhcg0tcz/image/upload/v1742958343/greenprep/SpeakingImg/3.png",
          createdAt: new Date(),
          updatedAt: new Date(),
        },

        // Dropdown List
        {
          ID: uuidv4(),
          StudentID: "c2756352-6db3-4ed3-9a6d-eed04a6bd757",
          TopicID: "ef6b69aa-2ec2-4c65-bf48-294fd12e13fc",
          QuestionID: "b53921ab-35d9-4700-98b3-5f7a80f96049",
          AnswerText: JSON.stringify([
            {
              key: "1. Who needs to use technology for their job?",
              value: "Lucy",
            },
            {
              key: "2. Who mainly uses technology to communicate with their family?",
              value: "Karl",
            },
            {
              key: "3. Who has to have the latest technology products?",
              value: "Beth",
            },
            {
              key: "4. Who thinks children should not use technology?",
              value: "Ken",
            },
            {
              key: "5. Who thinks people rely too much on technology?",
              value: "Karl",
            },
            {
              key: "6. Who doesn't use technology before going to bed?",
              value: "Lucy",
            },
            {
              key: "7. Who likes to use technology for entertainment?",
              value: "Beth",
            },
          ]),
          AnswerAudio:
            "https://res.cloudinary.com/dlhcg0tcz/image/upload/v1742958343/greenprep/SpeakingImg/3.png",
          createdAt: new Date(),
          updatedAt: new Date(),
        },

        // Writing
        {
          ID: uuidv4(),
          StudentID: "c2756352-6db3-4ed3-9a6d-eed04a6bd757",
          TopicID: "ef6b69aa-2ec2-4c65-bf48-294fd12e13fc",
          QuestionID: "b50f832d-56d8-4e33-9214-d713e76af26a",
          AnswerText: "hello my name is sinh",
          AnswerAudio: "",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("StudentAnswerDrafts", null, {});
  },
};
