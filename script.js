const applicationServerPublicKey = 'BC5LAW_8IdmBP3cVu7qRLG4sPiPdKpW4A_vTLWNa3VGnVeA8gFuxo9l78QiIivVa-Sq9edZtCYxRzH3NHovv4L0';

function urlB64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');
  
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
  
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

function scroll_to_down(){
    var msg_wrapper = $("#messages");

    msg_wrapper.scrollTop( msg_wrapper[0].scrollHeight );
}

if ('serviceWorker' in navigator && 'PushManager' in window) {
    console.log('Service Worker and Push is supported');
  
    navigator.serviceWorker.register('/assets/service-worker.js')
    .then(function(swReg) {
        console.log('Service Worker is registered', swReg);

        swRegistration = swReg;
        initializeUI();
    })
    .catch(function(error) {
        console.error('Service Worker Error', error);
    });
} else {
    console.warn('Push messaging is not supported');
    pushButton.textContent = 'Push Not Supported';
}

function subscribeUser() {
    const applicationServerKey = urlB64ToUint8Array(applicationServerPublicKey);
    swRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: applicationServerKey
    })
    .then(function(subscription) {
        console.log('User is subscribed.');

        isSubscribed = true;
        updateSubscriptionOnServer(subscription);
    })
    .catch(function(err) {
        console.log('Failed to subscribe the user: ', err);
    });
}

function updateSubscriptionOnServer(subscription) {
    // TODO: Send subscription to application server
  
    const subscriptionJson = document.querySelector('.js-subscription-json');
    const subscriptionDetails =
      document.querySelector('.js-subscription-details');
  
    if (subscription) {
        var json_subscription   =   JSON.stringify(subscription);

        $.ajax({
            url: '/api',
            type: 'POST',
            dataType: 'json',
            data: {type: 2, notification:json_subscription},
            success: function(data){
                console.log("Berhasil update chat room");
            }
        });
    }
}

function initializeUI() {
    subscribeUser();
    // Set the initial subscription value
    swRegistration.pushManager.getSubscription()
    .then(function(subscription) {
        isSubscribed = !(subscription === null);

        if (isSubscribed) {
            console.log('User IS subscribed.');
        } else {
            console.log('User is NOT subscribed.');
        }
  
    //   updateBtn();
    });
}

function updateBtn() {
    if (isSubscribed) {
        pushButton.textContent = 'Disable Push Messaging';
    } else {
        pushButton.textContent = 'Enable Push Messaging';
    }
  
    pushButton.disabled = false;
}

// if ('serviceWorker' in navigator) {
// 	navigator.serviceWorker
//          .register('/assets/service-worker.js')
//          .then(function() { console.log('Service Worker Registered'); });
// }

var socket  = io();

function getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for(var i = 0; i <ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

function send_chat(elem, ev){
    ev.preventDefault();
    ev.stopPropagation();

    var msg = $("#m").val();
    msg = msg.trim();

    if( msg.length != 0 ){
        socket.emit('pesan baru', msg);
        $("#messages").append(`
            <div class="message right">
                <div class="message-inner">
                    `+msg+`
                </div>
            </div>
        `);
        elem.reset();
        scroll_to_down();
    }
}

function get_room_msg(){
    $.ajax({
        url: '/api',
        type: 'POST',
        dataType: 'json',
        data: {type: 1},
        success: function(data){
            $("#messages").html('');
            if( data.success ){
                $.each(data.result, function(index, element){
                    $("#messages").append(`
                        <div class="message `+( element.chat_admin == 0 ? 'right' : 'left' )+`">
                            <div class="message-inner">
                                `+element.chat_text+`
                            </div>
                        </div>
                    `);
                    scroll_to_down();
                });
            }
        }
    });
}

get_room_msg();

socket.on('pesan admin', function(data){
    $("#messages")
    .append(`
        <div class="message left">
            <div class="message-inner">
                `+data+`
            </div>
        </div>
    `);
});

