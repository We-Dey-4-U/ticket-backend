// backend/config/db.js
//'mongodb+srv://ikenna:Tekere1983@cluster0.f63sfas.mongodb.net/stargirl?retryWrites=true&w=majority'

const mongoose = require('mongoose');

const connection = {};
//define async function name connect
async function connect() {
  if (connection.isConnected) {
    console.log('already connected');
    return;
  }
  if (mongoose.connections.length > 0) {
    connection.isConnected = mongoose.connections[0].readyState;
    if (connection.isConnected === 1) {
      console.log('use previous connection');
      return;
    }
    await mongoose.disconnect();
  }
  const db = await mongoose.connect('mongodb+srv://ikenna:Tekere1983@cluster0.f63sfas.mongodb.net/stargirl?retryWrites=true&w=majority');
  console.log('new connection');
  connection.isConnected = db.connections[0].readyState;
}

async function disconnect() {
  if (connection.isConnected) {
    if (process.env.NODE_ENV === 'production') {
      await mongoose.disconnect();
      connection.isConnected = false;
    } else {
      console.log('not disconnected');
    }
  }
}
function convertDocToObj(doc) {
  doc._id = doc._id.toString();
  doc.createdAt = doc.createdAt.toString();
  doc.updatedAt = doc.updatedAt.toString();
  return doc;
}

module.exports = { connect, disconnect, convertDocToObj };
