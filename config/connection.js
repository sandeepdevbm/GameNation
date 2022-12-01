const mongoClient=require('mongodb').MongoClient
const state={
    db:null
}
// mongodb://localhost:27017
module.exports.connect=function(done){
    const url='mongodb+srv://sandeep:sandeepdev@cluster0.prveh5p.mongodb.net/test'
    const dbname='games'

    mongoClient.connect(url,(err,data)=>{
        if(err) return done(err)
        state.db=data.db(dbname)
        done()
    })
    
}
module.exports.get=function() {
    return state.db
}