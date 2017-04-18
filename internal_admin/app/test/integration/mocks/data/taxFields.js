let date = new Date();

let expTaxonomy = [
  {
    id: 1,
    fieldName: "first taxonomy",
    fieldValue: "first expected",
    parentId: null,
    createdAt: date,
    updatedAt: date,
    qowSchemaId: 1,
    workProjectId: 1,
    companyId: 1
  },
  {
    id: 2,
    fieldName: "second taxonomy",
    fieldValue: "second expected",
    parentId: 1,
    createdAt: date,
    updatedAt: date,
    qowSchemaId: 1,
    workProjectId: 1,
    companyId: 1
  },
  {
    id: 3,
    fieldName: "third taxonomy",
    fieldValue: "third expected",
    parentId: 2,
    createdAt: date,
    updatedAt: date,
    qowSchemaId: 1,
    workProjectId: 1,
    companyId: 1
  }
];

module.exports = expTaxonomy;
