export default function FloatingUi() {
  return (
    <>
<button className="snd" id="snd" aria-label="Toggle sound" title="Sound on/off"><svg viewBox="0 0 24 24"><path d="M4 9v6h4l5 4V5L8 9H4z"/><path className="w" d="M16 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12"/><path className="x" d="M17 9l5 6M22 9l-5 6"/></svg></button>
<a className="wa-float" id="waF" href="https://wa.me/910000000000?text=Hi%20Anamika%2C%20I%20feel%20stuck%20and%20would%20like%20a%20consultation" target="_blank" rel="noopener" aria-label="Chat on WhatsApp"><svg viewBox="0 0 24 24"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18a8 8 0 0 1-4.1-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8 8 0 1 1 12 20z"/><path d="M8.6 7.5c-.2.4-.5 1.3.3 2.8.9 1.6 2.4 3 4 3.7 1.1.5 1.9.3 2.4-.4l.3-.8-1.7-.9-.7.8c-.9-.4-1.9-1.3-2.4-2.3l.6-.8-.8-1.8c-.4-.2-1.2-.2-1.3-.1z"/></svg></a>
<div className="wa-tip" id="waTip">Chat with us on WhatsApp</div>
<div className="side" id="side"><button id="prev" aria-label="Previous">↑</button><div className="trk"><i></i></div><div className="trk"><i></i></div><div className="trk"><i></i></div><button id="next" aria-label="Next">↓</button><span className="cnt" id="cnt">01</span></div>
<div id="panel"><h4>Notifications</h4><div id="plist"></div></div>
<div id="toasts"></div>
    </>
  );
}
