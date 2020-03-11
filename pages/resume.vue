<template>
  <div class="container mx-auto px-16">      
    <h1 class="font-bold text-3xl text-gray-800 px-3 mt-6 mb-4 text-center">
      Experience
    </h1>

    <div class="mt-6 text-sm text-gray-600">
        <ul>
        <li v-for="exp in experience"
           :key="exp.position"
           class="mt-4">
            <p> <strong class="font-bold text-base text-blue-600">{{ exp.time }}</strong> - 
            <em class="text-base text-gray-700">{{ exp.position }}</em></p>
            <div>
                <ul class="list-disc ml-10">
                    <li v-for="task in exp.tasks"
                       :key="task"
                        class="mt-2">
                        <p>{{ task }}</p>
                    </li>
                </ul>
            </div>
        </li>
        </ul>
    </div>

    <img :src="require(`~/assets/${resume1}`)"
                  alt="resume1"
                  class="h-48 justify-center m-auto mt-8">

    <h1 class="font-bold text-3xl text-gray-800 px-3 mt-10 mb-4 text-center">
      Education
    </h1>

    <div class="mt-6 text-sm text-gray-600">
        <ul>
        <li v-for="ed in education"
            :key="ed.level"
            class="mt-4">
            <p> <strong class="font-bold text-base text-blue-600">{{ ed.time }}</strong> - 
            <em class="text-base text-gray-700">{{ ed.level }}</em></p>
            <div>
                <ul class="list-disc ml-10">
                    <li v-for="detail in ed.details"
                       :key="detail"
                       class="mt-2">
                        <p>{{ detail }}</p>
                    </li>
                </ul>
            </div>
        </li>
        </ul>
    </div>

    <img :src="require(`~/assets/${resume2}`)"
                  alt="resume2"
                  class="h-48 justify-center m-auto mt-8">

    <h1 class="font-bold text-3xl text-gray-800 px-3 mt-10 mb-4 text-center">
      Certifications
    </h1>

    <div class="mt-6 text-sm text-gray-600">

        <ul class="list-disc">
        <li v-for="cert in certification"
            :key="cert.title"
            class="mt-2">
            <a rel="noopener" 
                class="font-semibold hover:underline text-gray-700"
                :href="cert.link">
                {{ cert.title }}
            </a>
        </li>
        </ul>
    </div>

  </div>
</template>

<script>
export default {
  components: {
  },
  data() {
      return {
          resume1: 'images/resume/resume1.svg',
          resume2: 'images/resume/resume2.svg',
          experience: [
              {
                  time: 'Current',
                  position: 'Big Data Developer at ServiZurich, Technology Delivery Center',
                  tasks: [
                      `ETL development on an on-premise cluster focusing on historical 
                      data archival and schema evolution using Spark, Scala, Hive and Avro.`,
                      `Azure Cloud migration, orchestrating with Data Factory and running on 
                      Databricks. Fine performance tunning of the jobs to daily ingest billions of data.`,
                      `Define and develop Azure DevOps pipelines as department guidelines.`,
                      `Implement cloud native applications.`
                  ]
              },
              {
                  time: 'Current',
                  position: 'Data Science Assistant teacher in EAE Business School (Part Time)',
                  tasks: []
              },
              {
                  time: 'Feb 2017 to Oct 2018',
                  position: 'Data Engineer at BaseTIS',
                  tasks: [
                      `Alvian Comunicaciones: Designed a solution from scratch for a daily
                       ETL process applying complex rules with AWS EC2, S3 and Redshif,
                       MongoDB, Python and Apache-Airflow. Managed a 3 people team to develop
                       the solution that better fit the client.`,
                       `Zeus (Naturgy): Analyst at an ETL project with large data volumes.
                       Validate the transformation and set the algorithms with SQL and Oracle’s PL/SQL.`,
                       `Prepare dashboards and scripts to have real-time insights on the data
                       transformation process and allow database monitoring through a web app with Python.`,
                       `Fira Barcelona: Automatic data extraction and format transformation for their
                        web and mobile application using Python. Automatization of technical 
                        specification sheets with JavaScript and QCAD API (CAD opensource tool).`,
                       `GenCat, TMB: Reporting with PowerBI.`,
                       `Organize Machine Learning and Deep Learning workshops to teach fundations
                       to the team.`
                  ]
              }
          ],
          education: [
              {
                  time: '2017 - 2018',
                  level: 'Master in Big Data Management, Technologies and Analytics, 9.1/10. UPC School',
                  details: []
              },
              {
                  time: '2013 - 2017',
                  level: 'Degree in Mathematics, Universitat Politècnica de Catalunya',
                  details: [
                      `Erasmus at the École polytechnique Fédérale de Lausanne`,
                      `Thesis: "Simulation and Estimation of Lévy driven stochastic processes"`
                  ]
              }
          ],
          certification: [
              {
                  title: 'Microsoft Certified: Azure Developer Associate',
                  link: 'https://www.youracclaim.com/badges/3fa3d129-bf21-42e3-afdf-ae2ae596a323/linked_in_profile'
              },
              {
                  title: 'Functional Programming Principles in Scala, Coursera',
                  link: 'https://www.coursera.org/account/accomplishments/verify/9XWXUYCV3TYN'
              },
              {
                  title: 'Functional Programming Design, Coursera',
                  link: 'https://www.coursera.org/account/accomplishments/verify/7Y92YK2Q9EWY'
              },
              {
                  title: 'AWS DevOps Engineer Nanodegree, Udacity',
                  link: 'https://confirm.udacity.com/MRMGCJL9'
              },
              {
                  title: 'SP840-Az: Managed Delta Lake, Azure Databricks',
                  link: 'https://academy.databricks.com/award/completion/5aad98fb-7efd-352b-af1b-09f1dcdd33dd'
              }
          ]
      }
  }
};
</script>