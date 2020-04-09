const sgMail = require('@sendgrid/mail')

sgMail.setApiKey(process.env.SENDGRID_API_KEY)
    

    //sgMail.send(email)
const sendEmail = (email, name) => {
    email = { 
      to: email,
      from: 'pedro.mtz.garcia@outlook.com',
      subject: 'Welcome messsage',
      text: `Welcome to peetOS ${name} we hope you have a nice day`
  }
  sgMail.send(email)
}

const emailDeleteAccount = (email, name) =>{
  email = { 
    to: email,
    from: 'pedro.mtz.garcia@outlook.com',
    subject: 'Delete Account',
    text: `We will mis you `
  }
  
  sgMail.send(email)
}

module.exports = {
  sendEmail, emailDeleteAccount
}

/* sgMail
    .send(email)
    .then(() => {}, error => {
      console.error(error);
   
      if (error.response) {
        console.error(error.response.body)
      }
}); */

    