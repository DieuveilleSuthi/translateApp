import React, { useState, useEffect, useRef } from 'react'
import Transcription from './Transcription'
import Translation from './Translation'

export default function Information(props) {
    const { output, finished } = props
    const [tab, setTab] = useState('transcription')
    const [translation, setTranslation] = useState(null)
    const [toLanguage, setToLanguage] = useState('Select language')
    const [translating, setTranslating] = useState(null)
    console.log(output)

    const worker = useRef()

    useEffect(() => {
        if (!worker.current) {
            worker.current = new Worker(new URL('../utils/translate.worker.js', import.meta.url), {
                type: 'module'
            })
        }

        const onMessageReceived = async (e) => {
            switch (e.data.status) {
                case 'initiate':
                    console.log('DOWNLOADING')
                    break;
                case 'progress':
                    console.log('LOADING')
                    break;
                case 'update':
                    setTranslation(e.data.output)
                    console.log(e.data.output)
                    break;
                case 'complete':
                    setTranslating(false)
                    console.log("DONE")
                    break;
            }
        }

        worker.current.addEventListener('message', onMessageReceived)

        return () => worker.current.removeEventListener('message', onMessageReceived)
    })

    const textElement = tab === 'transcription' ? output.map(val => val.text) : translation || ''

    function handleCopy() {
        navigator.clipboard.writeText(textElement)
    }

    function generateTranslation() {
        if (translating || toLanguage === 'Select language') {
            return
        }

        setTranslating(true)

        worker.current.postMessage({
            text: output.map(val => val.text),
            src_lang: 'eng_Latn',
            tgt_lang: toLanguage
        })
    }




    return (
        <main className='flex-1  p-4 flex flex-col gap-3 text-center sm:gap-4 justify-center pb-20 max-w-prose w-full mx-auto'>

            <div className={{display: 'flex'}}>
                <button onClick={() => setTab('transcription')} className={'px-4 rounded duration-200 py-1 ' + (tab === 'transcription' ? ' bg-yellow-300 text-white' : ' text-yellow-400 hover:text-yellow-600')}>Transcription</button>
                <button onClick={() => setTab('translation')} className={'px-4 rounded duration-200 py-1  ' + (tab === 'translation' ? ' bg-yellow-300 text-white' : ' text-yellow-400 hover:text-yellow-600')}>Translation</button>
            </div>
            <div className='my-8 flex flex-col-reverse max-w-prose w-full mx-auto gap-4'>
                {(!finished || translating) && (
                    <div className='grid place-items-center'>
                        <i className="fa-solid fa-spinner animate-spin"></i>
                    </div>
                )}
                {tab === 'transcription' ? (
                    <Transcription {...props} textElement={textElement} />
                ) : (
                    <Translation {...props} toLanguage={toLanguage} translating={translating} textElement={textElement} setTranslating={setTranslating} setTranslation={setTranslation} setToLanguage={setToLanguage} generateTranslation={generateTranslation} />
                )}
            </div>
            <div className='flex items-center gap-4 mx-auto '>
                <button onClick={handleCopy} title="Copy" className='bg-yellow  hover:text-yellow-500 duration-200 text-yellow-300 px-2 aspect-square grid place-items-center rounded'>
                    <i className="fa-solid fa-copy"></i>
                </button>
                <div className='gap-4 flex justify-center'>
                <a href="/" className='flex items-center gap-2 specialBtn px-3 py-2 rounded-lg text-yellow-400'>
                    <p>New</p>
                    <i className="fa-solid fa-plus"></i>
                </a>
            </div>
            </div>
        </main>
    )
}
