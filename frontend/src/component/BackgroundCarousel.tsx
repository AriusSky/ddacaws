import { useEffect, useState } from "react"
import './BackgroundCarousel.css'
import hospital1 from '../images/hospital-1.jpg'
import hospital2 from '../images/hospital-2.jpg'
import hospital3 from '../images/hospital-3.jpg'
import hospital4 from '../images/hospital-4.jpeg'
import hospital5 from '../images/hospital-5.jpg'
import hospital6 from '../images/hospital-6.jpg'
import hospital7 from '../images/hospital-7.jpg'
import hospital8 from '../images/hospital-8.jpg'

const images = [
    hospital1,
    hospital2,
    hospital3,
    hospital4,
    hospital5,
    hospital6,
    hospital7,
    hospital8,
]

export default function BackgroundCarousel({ interval = 10000 }: { interval?: number }) {
    const [index, setIndex] = useState(0)

    useEffect(() => {
        const id = setInterval(() => {
            setIndex(prev => (prev + 1) % images.length)
        }, interval)
        return () => clearInterval(id)
    }, [interval])

    return (
        <div className="carousel">
            {images.map((src, i) => (
                <div 
                    key={src}
                    className={`carousel__slide ${i === index ? 'is-active' : ''}`}
                    style={{ backgroundImage: `url(${src})`}}
                />
            ))}
        </div>
    )
}