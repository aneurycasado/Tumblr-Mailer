var fs = require('fs');
var ejs = require('ejs');
var csvFile = fs.readFileSync("friend_list.csv","utf8");
var emailTemplate = fs.readFileSync('email_template.ejs', 'utf-8')
var tumblr = require('tumblr.js');

var client = tumblr.createClient({
  consumer_key: '5nbKRLoz4HT26CLdkFM8ItliMxEBDndsUV1QUrseHVri7gIi3P',
  consumer_secret: 'qiHERdvMHFVZviY1UmQahqzZOEm2wLH2j13mfKl21EGOEUqRSb',
  token: '7U3RhpTwAvCA1Xw6SUzd1KaOuYQ9gyZb1GaW7YegedciNytYdJ',
  token_secret: 'C7WiuA9e7y3NncleuchxgJ1lPALF4Dgko9kalFKGrn3I5mEiim'
});

var mandrill = require('mandrill-api/mandrill');

var mandrill_client = new mandrill.Mandrill('EDj47QOs5FIJ6AKLCfHMcQ');

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

var contacts = csvParse(csvFile)

function isValid(date){
  var currentDate = new Date()
  var currentDay = currentDate.getDate()
  var currentMonth = currentDate.getMonth() + 1
  var currentYear = currentDate.getFullYear()
  var blogDay = date[8] + date[9]
  var blogMonth = date[5] + date[6]
  var blogYear = date[0] + date[1] + date[2] + date[3]
  if(blogYear != currentYear){
    return false
  }else if(blogMonth != currentMonth){
    return false
  }else{
    var distance = Math.abs(currentDay - blogDay)
    if(distance > 7){
      return false
    }else if(distance < 7){
      return true
    }
  }
}

function sendEmail(to_name, to_email, from_name, from_email, subject, message_html){
    var message = {
        "html": message_html,
        "subject": subject,
        "from_email": from_email,
        "from_name": from_name,
        "to": [{
                "email": to_email,
                "name": to_name
            }],
        "important": false,
        "track_opens": true,
        "auto_html": false,
        "preserve_recipients": true,
        "merge": false,
        "tags": [
            "Fullstack_Tumblrmailer_Workshop"
        ]
    };
    var async = false;
    var ip_pool = "Main Pool";
    mandrill_client.messages.send({"message": message, "async": async, "ip_pool": ip_pool}, function(result) {
        // console.log(message);
        // console.log(result);
    }, function(e) {
        // Mandrill returns the error as an object with name and message keys
        console.log('A mandrill error occurred: ' + e.name + ' - ' + e.message);
        // A mandrill error occurred: Unknown_Subaccount - No subaccount exists with the id 'customer-123'
    });
 }

client.posts("aneurycasado.tumblr.com", function(err, blog){
  var validPosts = []
  for(var i = 0; i < blog.posts.length; i++){
    var date = blog.posts[i].date
    if(isValid(date)){
      validPosts.push(blog.posts[i])
    }
  }
  for(var i = 0; i < contacts.length; i++){
    var object = contacts[i]
    var data = {firstName: object.firstName, numMonthsSinceContact: object.numMonthsContact,latestPosts: validPosts }
    var customizedTemplate = ejs.render(emailTemplate,data)
    sendEmail(object.firstName,object.email,"Aneury","aneury.casado@gmail.com","You can not stop me Github",customizedTemplate)
  }
});




//var emails = []

//function createEmails(contacts){
//  for(var i = 0; i < contacts.length;i++){
//    var object = contacts[i]
//    var customizedTemplate = ejs.render(emailTemplate,{firstName: object.firstName,numMonthsSinceContact: object.numMonthsContact})
//    emails.push(customizedTemplate)
//  }
//}
