import React, { useEffect, useRef, useState } from 'react';
import { hightlightsSlides } from '../constant';
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
        videoID: 0,
        isLastVideo: false,
        isPlaying: false,
    });

    const [loadedData, setLoadedData] = useState([]);
    const { isEnd, startPlay, videoID, isLastVideo, isPlaying } = video;

    useGSAP(() => {
        gsap.to('#slider', {
            x: `-${100 * videoID}%`,
            duration: 2,
            ease: 'power2.inOut',
        });
        gsap.to('#video', {
            scrollTrigger: {
                trigger: '#video',
                toggleActions: 'restart none none none',
            },
            onComplete: () => {
                setVideo((prevVideo) => ({
                    ...prevVideo,
                    startPlay: true,
                    isPlaying: true,
                }));
            },
        });
    }, [videoID]); // Correct dependency array

    useEffect(() => {
        if (loadedData.length > 3) {
            if (!isPlaying) {
                videoRef.current[videoID]?.pause();
            } else {
                startPlay && videoRef.current[videoID]?.play();
            }
        }
    }, [startPlay, videoID, isPlaying, loadedData]);

    const handleLoadedMetadata = (i, e) => setLoadedData((prevData) => [...prevData, e]);

    const handleProcess = (type, i) => {
        switch (type) {
            case 'video-end':
                if (i + 1 >= hightlightsSlides.length) {
                    // Restart from the first video when the last one ends
                    setVideo((prevVideo) => ({
                        ...prevVideo,
                        videoID: 0,
                        isPlaying: true,
                        isEnd: false,
                    }));
                } else {
                    setVideo((prevVideo) => ({
                        ...prevVideo,
                        isEnd: true,
                        videoID: i + 1,
                    }));
                }
                break;
            case 'video-last':
                setVideo((prevVideo) => ({ ...prevVideo, isLastVideo: true }));
                break;
            case 'video-reset':
                videoRef.current[0].currentTime = 0; // Reset the first video to the start
                setVideo((prevVideo) => ({ ...prevVideo, isLastVideo: false, videoID: 0, isPlaying: true }));
                break;
            case 'play':
                setVideo((prevVideo) => ({ ...prevVideo, isPlaying: true }));
                break;
            case 'pause':
                setVideo((prevVideo) => ({ ...prevVideo, isPlaying: false }));
                break;
            default:
                return;
        }
    };

    useEffect(() => {
        let currentProgress = 0;
        let anim; // Animation reference
        const span = videoSpanRef.current;

        if (span[videoID]) {
            anim = gsap.to(span[videoID], {
                onUpdate: () => {
                    const progress = Math.ceil(anim.progress() * 100);
                    if (progress !== currentProgress) {
                        currentProgress = progress;
                        gsap.to(span[videoID], {
                            width: `${currentProgress}%`,
                            backgroundColor: 'white',
                            height: '8px', // Make the progress bar thicker
                        });
                    }
                },
                onComplete: () => {
                    gsap.to(span[videoID], {
                        width: '100%',
                        backgroundColor: '#afafaf',
                        height: '8px', // Make the progress bar thicker
                    });
                },
                paused: true,
            });

            const animUpdate = () => {
                if (videoRef.current[videoID]) {
                    const progress = videoRef.current[videoID].currentTime / videoRef.current[videoID].duration;
                    anim.progress(progress);
                }
            };

            if (isPlaying) {
                gsap.ticker.add(animUpdate);
                anim.play(); // Play the GSAP animation
            } else {
                gsap.ticker.remove(animUpdate);
                anim.pause(); // Pause the GSAP animation
            }

            return () => {
                anim.kill();
                gsap.ticker.remove(animUpdate);
            };
        }
    }, [videoID, startPlay, isPlaying]);

    return (
        <>
            <div className='flex items-center'>
                {hightlightsSlides.map((list, i) => (
                    <div key={list.id} id='slider' className='sm:pr-20 pr-10'>
                        <div className='video-carousel_container'>
                            <div className='w-full h-full flex-center rounded-3xl overflow-hidden bg-black'>
                                <video
                                    id='video'
                                    playsInline={true}
                                    preload='auto'
                                    muted
                                    ref={(el) => (videoRef.current[i] = el)}
                                    onPlay={() =>
                                        setVideo((prevVideo) => ({
                                            ...prevVideo,
                                            isPlaying: true,
                                        }))
                                    }
                                    onLoadedMetadata={(e) => handleLoadedMetadata(i, e)}
                                    onEnded={() =>
                                        handleProcess('video-end', i)
                                    }
                                >
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
                    {hightlightsSlides.map((_, i) => (
                        <span
                            key={i}
                            ref={(el) => (videoDivRef.current[i] = el)}
                            className='mx-2 w-2 h-2 bg-gray-200 rounded-full cursor-pointer relative' // Increased width and height
                        >
                            <span
                                className='absolute h-full  w-0 bg-white rounded-full transition-width duration-300 ease-linear'
                                ref={(el) => (videoSpanRef.current[i] = el)}
                                style={{ height: '8px' }} // Set a thicker height
                            />
                        </span>
                    ))}
                </div>
                <button className='control-btn' onClick={() => isLastVideo ? handleProcess('video-reset') : isPlaying ? handleProcess('pause') : handleProcess('play')}>
                    <img
                        src={isLastVideo ? replayImg : isPlaying ? pauseImg : playImg}
                        alt='Control Button'
                    />
                </button>
            </div>
        </>
    );
};

export default VideoCarousel;
    