import React, { useState, useEffect, useRef } from 'react'

export default function HomePage(props) {
    const { setAudioStream } = props

    const [recordingStatus, setRecordingStatus] = useState('inactive')
    const [audioChunks, setAudioChunks] = useState([])
    const [duration, setDuration] = useState(0)

    const mediaRecorder = useRef(null)

    const mimeType = 'audio/webm'

    async function startRecording() {
        let tempStream
        console.log('Start recording')

        try {
            const streamData = await navigator.mediaDevices.getUserMedia({
                audio: true,
                video: false
            })
            tempStream = streamData
        } catch (err) {
            console.log(err.message)
            return
        }
        setRecordingStatus('recording')

        //create new Media recorder instance using the stream
        const media = new MediaRecorder(tempStream, { type: mimeType })
        mediaRecorder.current = media

        mediaRecorder.current.start()
        let localAudioChunks = []
        mediaRecorder.current.ondataavailable = (event) => {
            if (typeof event.data === 'undefined') { return }
            if (event.data.size === 0) { return }
            localAudioChunks.push(event.data)
        }
        setAudioChunks(localAudioChunks)
    }

    async function stopRecording() {
        setRecordingStatus('inactive')
        console.log('Stop recording')

        mediaRecorder.current.stop()
        mediaRecorder.current.onstop = () => {
            const audioBlob = new Blob(audioChunks, { type: mimeType })
            setAudioStream(audioBlob)
            setAudioChunks([])
            setDuration(0)
        }
    }

    useEffect(() => {
        if (recordingStatus === 'inactive') { return }

        const interval = setInterval(() => {
            setDuration(curr => curr + 1)
        }, 1000)

        return () => clearInterval(interval)
    })


    return (
        <main className='flex-1  p-4 flex flex-col gap-3 text-center sm:gap-4  justify-center pb-20'>
            <h3 className='font-medium md:text-lg'>Record <span>&rarr;</span> <span className='text-yellow-400'>Transcribe</span> <span>&rarr;</span> Translate</h3>
            <button onClick={recordingStatus === 'recording' ? stopRecording : startRecording} className='flex specialBtn px-4 py-2 rounded-xl items-center text-base justify-between gap-4 mx-auto w-72 max-w-full my-4'>
                <p className='text-yellow-400'>{recordingStatus === 'inactive' ? 'Record' : `Stop recording`}</p>
                <div className='flex items-center gap-2'>
                    <i className={"fa-solid duration-200 fa-microphone " + (recordingStatus === 'recording' ? ' text-rose-300' : "")}></i>
                </div>
            </button>
            <div className='gap-4 flex justify-center'>
                <a href="/" className='flex items-center gap-2 specialBtn px-3 py-2 rounded-lg text-yellow-400'>
                    <p>New</p>
                    <i className="fa-solid fa-plus"></i>
                </a>
            </div>
        </main>
    )
}
