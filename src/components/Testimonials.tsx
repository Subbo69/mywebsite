import { useRef, useEffect, useState } from 'react';
import { Linkedin, Mail, MessageSquare, X } from 'lucide-react';

export default function Testimonials() {
  const [selectedReview, setSelectedReview] = useState<number | null>(null);

  const reviews = [
    {
      name: "@sarah_tech",
      role: "CEO, TechStart",
      link: "https://linkedin.com",
      icon: "linkedin",
      review: "HaloVision transformed our customer service with their AI agents. Response times dropped by 80% and satisfaction is at an all-time high.",
    },
    {
      name: "@mike_growth",
      role: "Founder, GrowthLab",
      link: "https://facebook.com",
      icon: "facebook",
      review: "The automation solutions they built for us freed up our team to focus on strategic work. ROI was evident within the first month.",
    },
    {
      name: "@emma_sales",
      role: "Director, SalesForce",
      link: "https://teams.microsoft.com",
      icon: "teams",
      review: "Their lead generation AI is incredible. We're now capturing and qualifying leads 24/7 without effort. Conversion is way up.",
    },
    {
      name: "@david_cloud",
      role: "Manager, CloudSync",
      link: "https://twitter.com",
      icon: "twitter",
      review: "Working with HaloVision was seamless. They delivered a custom solution that exceeded expectations. Highly responsive team.",
    },
  ];

  const infiniteReviews = [...reviews, ...reviews];

  const getIcon = (iconType: string) => {
    switch (iconType) {
      case 'linkedin': return <Linkedin className="w-2.5 h-2.5" />;
      case 'mail': return <Mail className="w-2.5 h-2.5" />;
      default: return <MessageSquare className="w-2.5 h-2.5" />;
    }
  };

  return (
    <section className="relative py-8 md:py-12 bg-transparent overflow-hidden">
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes typing {
          from { width: 0 }
          to { width: 100% }
        }
        @keyframes blink-caret {
          from, to { border-color: transparent }
          50% { border-color: black }
        }
        .typewriter-title {
          overflow: hidden;
          white-space: nowrap;
          border-right: 2px solid black; 
          display: inline-block;
          animation: 
            typing 1.5s steps(20, end),
            blink-caret 0.75s step-end 3;
          animation-fill-mode: forwards;
        }

        @keyframes fadeInMarquee {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .reveal-marquee {
          opacity: 0;
          animation: fadeInMarquee 0.8s ease-out forwards;
          animation-delay: 1.9s;
        }

        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          /* Speed increased: 21s reduced by 30% = 14.7s */
          animation: marquee 14.7s linear infinite;
        }
        .pause-marquee:hover .animate-marquee {
          animation-play-state: paused;
        }
      `}} />

      <div className="relative max-w-7xl mx-auto px-6 z-10">
        <div className="mb-4">
          <div className="inline-block">
            <h3 className="typewriter-title text-lg md:text-xl font-black text-black tracking-tight uppercase">
              What People Say
            </h3>
          </div>
          <div className="mt-0.5 h-1 w-10 bg-black rounded-full" />
        </div>

        <div className="relative pause-marquee reveal-marquee">
          {/* Edge Fades */}
          <div className="absolute left-[-2px] top-[-20px] bottom-[-20px] w-24 md:w-32 z-20 pointer-events-none bg-gradient-to-r from-white via-white/80 to-transparent" />
          <div className="absolute right-[-2px] top-[-20px] bottom-[-20px] w-24 md:w-40 z-20 pointer-events-none bg-gradient-to-l from-white via-white/80 to-transparent" />

          {/* Scrolling Container */}
          <div className="flex overflow-hidden py-6">
            <div className="flex gap-6 animate-marquee whitespace-nowrap">
              {infiniteReviews.map((review, index) => (
                <div
                  key={index}
                  onClick={() => setSelectedReview(index % reviews.length)}
                  className="
                    flex-shrink-0 w-[245px] md:w-[300px] 
                    bg-white
                    border border-black 
                    rounded-lg p-4
                    transition-all duration-200 text-left cursor-pointer group
                    shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]
                    hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]
                    hover:translate-x-[3px] hover:translate-y-[3px]
                    whitespace-normal
                  "
                >
                  <p className="text-black/90 text-[14px] leading-[20px] mb-3 font-bold italic h-[60px] overflow-hidden">
                    "{review.review}"
                  </p>

                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-black border border-black flex-shrink-0" />
                    
                    <a 
                      href={review.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="flex-1 min-w-0 hover:opacity-60 transition-opacity"
                    >
                      <span className="text-black font-black text-[9px] block truncate uppercase leading-none underline decoration-black/20 decoration-1 underline-offset-2">
                        {review.name}
                      </span>
                      <p className="text-black/50 text-[6.5px] font-bold uppercase tracking-wider leading-none mt-0.5">
                        {review.role}
                      </p>
                    </a>

                    <div className="text-black/20 group-hover:text-black transition-colors">
                      {getIcon(review.icon)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedReview !== null && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" 
          onClick={() => setSelectedReview(null)}
        >
          <div 
            className="bg-white border border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rounded-xl p-6 max-w-sm w-full relative" 
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={() => setSelectedReview(null)} 
              className="absolute top-2 right-2 p-1 hover:bg-black/5 rounded-full transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-full border border-black bg-black" />
              <div>
                <a 
                  href={reviews[selectedReview].link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline block"
                >
                  <h4 className="font-black text-xs uppercase">{reviews[selectedReview].name}</h4>
                </a>
                <p className="text-[9px] font-bold text-black/50 uppercase">{reviews[selectedReview].role}</p>
              </div>
            </div>
            <p className="text-base font-bold italic leading-snug">"{reviews[selectedReview].review}"</p>
          </div>
        </div>
      )}
    </section>
  );
}
