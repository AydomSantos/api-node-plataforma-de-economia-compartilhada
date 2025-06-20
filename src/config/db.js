const mongoose = require('mongoose');

const connectToDatabase = async () => {
    try{
        const conn = await mongoose.connect(process.env.MONGO_URL); 
        console.log(`MongoDB conectado: ${conn.connection.host}`);

    }catch(error){
        console.log(error);
    }
}

module.exports = connectToDatabase;