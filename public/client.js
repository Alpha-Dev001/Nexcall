// Connect to the live server - change this if your URL changes
const socket = io('https://nexcall-5srd.onrender.com');
let localStream;
let remoteStream;
let peerConnection;

const servers = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' }
    ]
};

const localVideo = document.getElementById('localVideo');
const remoteVideo = document.getElementById('remoteVideo');

// Add connection status logging
socket.on('connect', () => {
    console.log('Connected to server with ID:', socket.id);
});

socket.on('disconnect', () => {
    console.log('Disconnected from server');
});

socket.on('connect_error', (error) => {
    console.log('Connection error:', error);
});

async function startCall() {
    try {
        console.log('Starting call...');
        localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        localVideo.srcObject = localStream;
        console.log('Local media stream obtained');

        peerConnection = new RTCPeerConnection(servers);
        console.log('Peer connection created');

        localStream.getTracks().forEach(track => {
            peerConnection.addTrack(track, localStream);
        });

        peerConnection.ontrack = (event) => {
            console.log('Received remote track');
            remoteVideo.srcObject = event.streams[0];
        };

        peerConnection.onicecandidate = (event) => {
            if (event.candidate) {
                console.log('Sending ICE candidate');
                socket.emit('ice-candidate', { candidate: event.candidate, room: currentRoom });
            }
        };

        peerConnection.oniceconnectionstatechange = (event) => {
            console.log('ICE connection state changed:', peerConnection.iceConnectionState);
            if (peerConnection.iceConnectionState === 'failed') {
                console.log('ICE connection failed');
                alert('ICE connection failed');
            }
        };

        peerConnection.onnegotiationneeded = () => {
            console.log('Negotiation needed');
        };

        peerConnection.onaddstream = (event) => {
            console.log('Received remote stream');
            remoteVideo.srcObject = event.stream;
        };

        peerConnection.onremovestream = (event) => {
            console.log('Removed remote stream');
            remoteVideo.srcObject = null;
        };

        peerConnection.onsignalingstatechange = (event) => {
            console.log('Signaling state changed:', peerConnection.signalingState);
        };

        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);
        console.log('Created offer, sending to room:', currentRoom);
        socket.emit('offer', { offer, room: currentRoom });

    } catch (error) {
        console.error('Error starting call:', error);
        alert('Error starting call: ' + error.message);
    }
}

function endCall() {
    if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
    }
    if (peerConnection) {
        peerConnection.close();
    }
    localVideo.srcObject = null;
    remoteVideo.srcObject = null;
}

let currentRoom;

function joinRoom() {
    const roomInput = document.getElementById('roomInput');
    currentRoom = roomInput.value;

    if (currentRoom) {
        socket.emit('join-room', currentRoom);
        console.log('Joined room:', currentRoom);
    }
}

socket.on('user-connected', (userId) => {
    console.log('User connected:', userId);
    startCall();
});

socket.on('offer', async (offer) => {
    try {
        console.log('Received offer from remote user');
        if (!peerConnection) {
            peerConnection = new RTCPeerConnection(servers);
            console.log('Created peer connection for incoming call');

            localStream.getTracks().forEach(track => {
                peerConnection.addTrack(track, localStream);
            });

            peerConnection.ontrack = (event) => {
                console.log('Received remote track in offer handler');
                remoteVideo.srcObject = event.streams[0];
            };

            peerConnection.onicecandidate = (event) => {
                if (event.candidate) {
                    console.log('Sending ICE candidate from offer handler');
                    socket.emit('ice-candidate', { candidate: event.candidate, room: currentRoom });
                }
            };
        }

        await peerConnection.setRemoteDescription(offer);
        console.log('Set remote description from offer');
        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);
        console.log('Created answer, sending to room:', currentRoom);
        socket.emit('answer', { answer, room: currentRoom });
    } catch (error) {
        console.error('Error handling offer:', error);
        alert('Error handling incoming call: ' + error.message);
    }
});

socket.on('answer', async (answer) => {
    try {
        console.log('Received answer from remote user');
        await peerConnection.setRemoteDescription(answer);
        console.log('Set remote description from answer');
    } catch (error) {
        console.error('Error handling answer:', error);
    }
});

socket.on('ice-candidate', async (candidate) => {
    try {
        if (peerConnection) {
            console.log('Adding ICE candidate');
            await peerConnection.addIceCandidate(candidate);
        }
    } catch (error) {
        console.error('Error adding ICE candidate:', error);
    }
});
