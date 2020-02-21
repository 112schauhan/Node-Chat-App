const socket=io()
//options
const { username,room } =Qs.parse(location.search,{ ignoreQueryPrefix:true })

//elements
$messageForm=document.querySelector('#message-form')
$messageInput=$messageForm.querySelector('#message')
$messageFormButton=$messageForm.querySelector('#sendMessage')
$sendLocationButton=document.querySelector('#send-location')
$message=document.querySelector('#messages')

//templates
const messageTemplate=document.querySelector('#message-template').innerHTML
const locationTemplate=document.querySelector('#location-template').innerHTML
const sidebarTemplate=document.querySelector('#sidebar-template').innerHTML

// socket.on('countUpdated',(count)=>{
//     console.log('Count has been updated!!',count)
// })

//auto scroll
// const autoscroll=()=>{
//     //New message element
//     const $newMessage=$message.lastElementChild

//     //Height of the new message
//     const newMessageStyles=getComputedStyle($newMessage)
//     const newMessageMargin=parseInt(newMessageStyles.marginBottom)
//     const newMessageHeight=$newMessage.offsetHeight + newMessageMargin

//     //visible height
//     const visibleHeight=$message.offsetHeight

//     //height of the message container
//     const containerHeight=$message.scrollHeight

//     //how far has been scrolled
//     const scrollOffset=$message.scrollTop + visibleHeight

//     if(containerHeight - newMessageHeight <= scrollOffset){
//         $message.scrollTop=$message.scrollHeight
//     }

// }


socket.on('message',(message)=>{
    //console.log(message)
    const html=Mustache.render(messageTemplate,{
        username:message.username,
        message:message.text,
        createdAt:moment(message.createdAt).format('h:mm a')
    })

    $message.insertAdjacentHTML('beforeEnd',html)

})


socket.on('locationMessage',(message)=>{
    // console.log(url)
    const html=Mustache.render(locationTemplate,{
        username:message.username,
        url:message.url,
        createdAt:moment(message.createdAt).format('h:mm a')
    })
    $message.insertAdjacentHTML('beforeEnd',html)
})


// document.querySelector('#increment').addEventListener('click',(e)=>{
//     console.log('Clicked')
//     socket.emit('increment')
// })

$messageForm.addEventListener('submit',(e)=>{
    e.preventDefault()

    //disable form button
    $messageFormButton.setAttribute('disabled','disabled')

    const message=e.target.elements.message.value

    socket.emit('sendMessage',message,()=>{
        //enable form button
        $messageFormButton.removeAttribute('disabled')
        $messageInput.value="" 
        $messageInput.focus()

        console.log('Message has been delivered')
    })
})

$sendLocationButton.addEventListener('click',(e)=>{
    if(!navigator.geolocation){
        return alert("Geolocation not supported!!")
    }

    navigator.geolocation.getCurrentPosition((position)=>{
        
        //disable location button
        $sendLocationButton.setAttribute('disabled','disabled')

        
        socket.emit('sendLocation',{
            latitude:position.coords.latitude,
            longitude:position.coords.longitude
        },()=>{
            //enable location button
            $sendLocationButton.removeAttribute('disabled')
            console.log('Location has been shared')
        })
    })
})



socket.emit('join',{username,room},(error)=>{
    if(error){
        alert(error)
        location.href='/'
    }
})


socket.on('roomData',({ room,users })=>{
    const html=Mustache.render(sidebarTemplate,{
        room,
        users
    })

    document.querySelector("#sidebar").innerHTML=html
})





