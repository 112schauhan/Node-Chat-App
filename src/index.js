const path=require('path')
const http=require('http')
const socketio=require('socket.io')
const Filter=require('bad-words')



const port=process.env.PORT || 3000
const publicDirectoryPath=path.join(__dirname,'../public')
const express=require('express')
const app=express()
const server=http.createServer(app)
const io=socketio(server)

const { addUser,removeUser,getUser,getUsersInRoom }=require('../src/utils/users')
const {generateMessage,generateLocation}=require('./utils/messages')



app.use(express.json())
app.use(express.static(publicDirectoryPath))

let count=5;
io.on('connection',(socket)=>{
    console.log('New websocket connection')
    // socket.emit('countUpdated',count)
   


    socket.on('join',(options,callback)=>{
        const { error,user }=addUser({ id:socket.id,...options })
        

        if(error){
            return callback(error)
        }

        socket.join(user.room)

        socket.emit('message',generateMessage(user.username,`Welcome ${user.username}!!`))
        socket.broadcast.to(user.room).emit('message',generateMessage(`${user.username} has joined`))
        io.to(user.room).emit('roomData',{
            room:user.room,
            users:getUsersInRoom(user.room)
        })

        callback()

    })


    // socket.on('increment',()=>{
    //     count++
    //     io.emit('countUpdated',count)
    // })
    socket.on('sendMessage',(message,callback)=>{
        const user =getUser(socket.id)

        if(user){
            const filter=new Filter()

        if(filter.isProfane(message)){
            return alert('Profanity is not allowed')
        }
        
        io.to(user.room).emit('message',generateMessage(user.username,message))
        callback()
        }
    })

    socket.on('sendLocation',(coords,callback)=>{

        const user=getUser(socket.id)
        if(user){
            io.to(user.room).emit('locationMessage',generateLocation(user.username,`https://www.google.com/maps?q=${coords.latitude},${coords.longitude}`))
            callback()
        }
       
    })

    socket.on('disconnect',()=>{
        const user=removeUser(socket.id)

        if(user){
            io.to(user.room).emit('message',generateMessage(`${user.username} has left!!`))
            io.to(user.room).emit('roomData',{
                room:user.room,
                users:getUsersInRoom(user.room)
            })
        }
       
    })
})


server.listen(port,()=>{
    console.log('Server is up on port ',port)
})