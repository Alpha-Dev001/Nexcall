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
const roomSection = document.getElementById('roomSection');
const videoSection = document.getElementById('videoSection');
const loadingState = document.getElementById('loadingState');
const roomInput = document.getElementById('roomInput');
const startCallBtn = document.getElementById('startCallBtn');
const endCallBtn = document.getElementById('endCallBtn');
const connectionStatus = document.getElementById('connectionStatus');
const statusText = document.getElementById('statusText');
const userCount = document.getElementById('userCount');
const remoteVideoContainer = document.getElementById('remoteVideoContainer');

// Add connection status logging
socket.on('connect', () => {
    console.log('Connected to server with ID:', socket.id);
    updateConnectionStatus('online', 'Connected');
});

socket.on('disconnect', () => {
    console.log('Disconnected from server');
    updateConnectionStatus('connecting', 'Disconnected');
});

socket.on('connect_error', (error) => {
    console.log('Connection error:', error);
    updateConnectionStatus('connecting', 'Connection error');
});

// Update UI elements
function updateConnectionStatus(status, text) {
    connectionStatus.className = `status-indicator status-${status}`;
    statusText.textContent = text;
}

function updateUserCount(count) {
    userCount.querySelector('span').textContent = count;
}

function showSection(section) {
    roomSection.classList.add('hidden');
    videoSection.classList.add('hidden');
    loadingState.classList.add('hidden');

    section.classList.remove('hidden');
    section.classList.add('slide-up');
}

function showLoading(message = 'Connecting...') {
    showSection(loadingState);
    loadingState.querySelector('p').textContent = message;
}

function showVideo() {
    showSection(videoSection);
}

function showRoom() {
    showSection(roomSection);
}

function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.className = `notification notification-${type}`;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.classList.add('fade-out');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

async function startCall() {
    if (!currentRoom) {
        console.error('No room set - please join a room first');
        showNotification('Please join a room first!', 'error');
        return;
    }

    try {
        console.log('Starting call in room:', currentRoom);
        showLoading('Starting premium video call...');

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
            remoteVideoContainer.classList.remove('hidden');
            showNotification('Remote user connected!', 'success');
        };

        peerConnection.onicecandidate = (event) => {
            if (event.candidate) {
                console.log('Sending ICE candidate');
                socket.emit('ice-candidate', { candidate: event.candidate, room: currentRoom });
            }
        };

        peerConnection.oniceconnectionstatechange = (event) => {
            console.log('ICE connection state changed:', peerConnection.iceConnectionState);
            if (peerConnection.iceConnectionState === 'connected') {
                showNotification('Connection established!', 'success');
            } else if (peerConnection.iceConnectionState === 'failed') {
                showNotification('Connection failed. Please try again.', 'error');
            }
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

        showVideo();

    } catch (error) {
        console.error('Error starting call:', error);
        showNotification('Error starting call: ' + error.message, 'error');
        showRoom();
    }
}

function endCall() {
    if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
    }
    if (peerConnection) {
        peerConnection.close();
        peerConnection = null;
    }
    localVideo.srcObject = null;
    remoteVideo.srcObject = null;
    remoteVideoContainer.classList.add('hidden');

    showNotification('Call ended', 'info');
    showRoom();
}

let currentRoom;

function joinRoom() {
    const roomValue = roomInput.value.trim();

    if (!roomValue) {
        showNotification('Please enter a room ID', 'error');
        return;
    }

    currentRoom = roomValue;
    showLoading(`Joining premium room: ${roomValue}`);

    socket.emit('join-room', currentRoom);
    console.log('Joined room:', currentRoom);
    updateUserCount(1); // One user in room
}

socket.on('user-connected', (userId) => {
    console.log('User connected:', userId);
    updateUserCount(2); // Two users in room
    startCall();
});

socket.on('offer', async (offer) => {
    if (!currentRoom) {
        console.error('No room set when receiving offer');
        return;
    }

    try {
        console.log('Received offer from remote user for room:', currentRoom);
        if (!peerConnection) {
            peerConnection = new RTCPeerConnection(servers);
            console.log('Created peer connection for incoming call');

            localStream.getTracks().forEach(track => {
                peerConnection.addTrack(track, localStream);
            });

            peerConnection.ontrack = (event) => {
                console.log('Received remote track in offer handler');
                remoteVideo.srcObject = event.streams[0];
                remoteVideoContainer.classList.remove('hidden');
                showNotification('Remote user connected!', 'success');
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
        showNotification('Error handling incoming call: ' + error.message, 'error');
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

socket.on('user-disconnected', (userId) => {
    console.log('User disconnected:', userId);
    updateUserCount(1); // Back to one user
    showNotification('User left the call', 'info');
});
