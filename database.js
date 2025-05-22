const admin = require("firebase-admin");
var serviceAccount = require("./credentials/mes-chatbot-5495594e0cac.json");
require("dotenv").config();
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount/*JSON.stringify({
        "type": process.env.type,
        "project_id": process.env.project_id,
        "private_key_id": process.env.private_key_id,
        "private_key": process.env.private_key,
        "client_email": process.env.client_email,
        "client_id": process.env.client_id,
        "auth_uri": process.env.auth_uri,
        "token_uri": process.env.token_uri,
        "auth_provider_x509_cert_url": process.env.auth_provider_x509_cert_url,
        "client_x509_cert_url": process.env.client_x509_cert_url
    }){
        type: process.env.TYPE,
        project_id: process.env.PROJECT_ID,
        private_key_id: process.env.PRIVATE_KEY_ID,
        private_key: process.env.PRIVATE_KEY,
        client_email: process.env.CLIENT_EMAIL,
        client_id: process.env.CLIENT_ID,
        auth_uri: process.env.AUTH_URI,
        token_uri: process.env.TOKEN_URI,
        auth_provider_x509_cert_url: process.env.AUTH_PROVIDER_X509_CERT_URI,
        client_x509_cert_url: process.env.CLIENT_X509_CERT_URI
    }*/)
  });


async function addReceiver(phone_number, first_name, last_name, user_id) {
    let name = last_name ? first_name + " " + last_name : first_name
    return await admin.firestore()
    .collection('receivers')
    .doc(user_id.toString())
    .set({
        name,
        phone_number,
        telegram_id: user_id
    })
}

async function getReceivers(){
    return await admin.firestore().collection("receivers").get()
}

async function getReceiver(id){
    return await admin.firestore().collection("receivers").doc(id.toString()).get()
}

async function getNotifications(){
    return await admin.firestore().collection("notifications").get()
}

async function getAdmin(){
    return await admin.firestore().collection("settings").doc("admin").get()
}

async function setAdmin(first_name, last_name, phone_number, telegram_id){
    let name = last_name ? first_name + " " + last_name : first_name
    return await admin.firestore().collection("settings").doc("admin").set(
        {
            name,
            phone_number,
            telegram_id
        }
    )
}

module.exports = {
    addReceiver,
    getNotifications,
    getReceiver,
    getReceivers,
    getAdmin,
    setAdmin,
    admin
}