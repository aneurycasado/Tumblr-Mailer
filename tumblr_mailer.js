var fs = require('fs');
var ejs = require('ejs');
var csvFile = fs.readFileSync("friend_list.csv","utf8");
var emailTemplate = fs.readFileSync('email_template.html', 'utf-8')

function csvParse(csvFile){
  var array = csvFile.split("\n")
  var objectsArray = []
  for(var i = 1; i < array.length-1;i++){
    var object = {}
    var line = array[i].split(",")
    object.firstName = line[0]
    object.lastName = line[1]
    object.numMonthsContact = line[2]
    object.email = line[3]
    objectsArray.push(object)
  }
  return objectsArray
}

var emails = []

function createEmails(contacts){
  for(var i = 0; i < contacts.length;i++){
    var object = contacts[i]
    var customizedTemplate = ejs.render(emailTemplate,{firstName: object.firstName,numMonthsSinceContact: object.numMonthsContact})
    emails.push(customizedTemplate)
  }
}

var contacts = csvParse(csvFile)
createEmails(contacts)
console.log(emails)
