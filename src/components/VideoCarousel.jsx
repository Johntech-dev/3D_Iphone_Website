import React, { useEffect, useRef, useState } from 'react'
import { hightlightsSlides } from '../constant'
import gsap from 'gsap';
import { pauseImg, playImg, replayImg } from '../utils';
import { useGSAP } from '@gsap/react';

const VideoCarousel = () => {

    const videoRef = useRef([]);
    const videoSpanRef = useRef([]);
    const videoDivRef = useRef([]);

    const [video, setVideo] = useState({
        isEnd: false,
        startPlay: false,
        videoID : 0,
        isLastVideo: false,
        isPlaying: false,
    })

    useGSAP(() => {
        gsap.to('#video', {
            scrollTrigger: {
                trigger: '#video',
                toggleActions: 'restart none none none'
            },
            onComplete: () => {
                setVideo((prevVideo) => ({
                    ...prevVideo,
                    startPlay: true,
                    isPlaying: true,
                }))
            }
        })
    },[isEnd, videoID])
    const [loadedData, setLoadedData] = useState([])

    const {isEnd, startPlay, videoID, isLastVideo, isPlaying} = video;

   useEffect(() => {
     if(loadedData.length > 3) {
        if(!isPlaying) {
            videoRef.current[videoID].pause();
        } else {
            startPlay && videoRef.current[videoID].play();
        }
     }
   }, [startPlay, videoID, isPlaying, loadedData])
   
   const handleProcess = (type, i) => { 
    switch (type) {
        case 'video-end':
            setVideo((prevVideo) => ({ ...prevVideo, isEnd: true, videoID: i + 1 }));
            break;
         case 'video-last': 
         setVideo((prevVideo) => ({ ...prevVideo, isLastVideo: true}))
         break;
         case 'video-reset' :
         setVideo((prevVideo) => ({...prevVideo, isLastVideo: false, videoID: 0}))
         break;
         case 'play' :
            setVideo((prevVideo) => ({...prevVideo, isPlaying: !prevVideo.isPlaying}))
            break;
        default:
        return video
    }
}


    useEffect(() => {
     const currentProgress = 0;
     let span = videoSpanRef.current;
     
     if(span[videoID]) {
    let anime = gsap.to(span[videoID], {
        onUpdate: () => {

        },
        onComplete: () => {
              
        }
    })
     }

    }, [videoID, startPlay])

  return (
   <>
   <div className='flex items-center'>
      { hightlightsSlides.map((list, i) => (
        <div key={list.id} id='slider' className='sm:pr-20 pr-10'>
           <div className='video-carousel_container'>
              <div className='w-full h-full flex-center rounded-3xl overflow-hidden bg-black'>
                  <video id='video' playsInline={true} preload='auto' muted ref={(el) => (videoRef.current[i] = el)} onPlay={() => {
                    setVideo((prevVideo) => ({
                        ...prevVideo,
                        isPlaying: true,
                    }))
                  }}>
                    <source src={list.video} type='video/mp4' />
                  </video>
              </div>
              <div className='absolute top-12 left-[5%] z-10'>
                  {list.textLists.map((text) => (
                    <p key={text} className='md:text-2xl text-xl font-medium'>
                        {text}
                    </p>
                  ))}
              </div>
           </div>
        </div>
      ))}
   </div>
   <div className='relative flex-center mt-10'>
    <div className='flex-center py-5 px-7 bg-gray-300 backdrop-blur-sm rounded-full'>
      {videoRef.current.map((_, i) => (
        <span key={i}
        ref={(el) => (videoDivRef.current[i] = el)}
        className='mx-2 w-3 h-3 bg-gray-200 rounded-full cursor-pointer'
        >
            <span className='absolute h-full w-full rounded-full' ref={(el) => (videoSpanRef.current[i] = el)} />
        </span>
      ))}
    </div>
    <button className='control-btn'>
        <img src={isLastVideo ? replayImg : !isPlaying ? playImg : pauseImg } onClick={isLastVideo ? () => handleProcess('video-reset') 
            : !isPlaying ? () => handleProcess('play') : () => handleProcess('pause')}
        />
    </button>
   </div>
   </>
  )
}

export default VideoCarousel