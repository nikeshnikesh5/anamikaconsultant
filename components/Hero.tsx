export default function Hero() {
  return (
    <>
<section className="hero">
  <nav id="nav">
    <div className="logo"><i id="logoMark"></i><span className="lg-n">Anamika</span><small className="lg-c">Consultant</small></div>
    <ul><li><a href="#services">Services</a></li><li><a href="#business">Business</a></li><li><a href="#next">Process</a></li><li><a href="#proof">Results</a></li><li><a href="#faq">FAQ</a></li></ul>
    <div className="nr"><button className="bell" id="bell" aria-label="Notifications"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9a6 6 0 1 1 12 0c0 6 2 7 2 7H4s2-1 2-7"/><path d="M10 20a2 2 0 0 0 4 0"/></svg><b id="badge" style={{display:'none'}}>0</b></button><a className="btn g" href="#chat">Book a Consultation</a></div>
  </nav>

  <div className="content">
    <div>
      <div className="slides"><div className="slide" id="sl0">
      <div className="tag" id="tag">Astro Science · Private Consultations</div>
      <h1 id="title">
        <span className="w"><i>Decode</i></span> <span className="w"><i>the</i></span> <span className="w"><i>cosmos.</i></span><br />
        <span className="w"><i className="grad">Design</i></span> <span className="w"><i className="grad">your</i></span> <span className="w"><i className="grad">future.</i></span>
      </h1>
      <p className="sub" id="sub">Data-driven astrological consulting backed by planetary science. Get a precise birth-chart analysis and a clear plan for career, relationships and timing.</p>
      <div className="cta" id="cta">
        <a className="btn p mag" href="#">Book a Consultation →</a>
        <a className="btn g mag" href="#">Get Free Chart</a>
      </div>
      </div>
      <div className="slide x" id="sl1">
        <div className="tag">Birth-Chart Science</div>
        <h1><span className="w"><i>Your</i></span> <span className="w"><i>chart,</i></span> <span className="w"><i>decoded</i></span><br /><span className="w"><i className="grad">with</i></span> <span className="w"><i className="grad">real</i></span> <span className="w"><i className="grad">data.</i></span></h1>
        <p className="sub">Planetary positions, houses and aspects calculated from NASA-grade ephemeris data, then explained in plain language.</p>
        <div className="cta"><a className="btn p mag" href="#">Get My Chart →</a><a className="btn g mag" href="#">See Methods</a></div>
      </div>
      <div className="slide x" id="sl2">
        <div className="tag">Timing Intelligence</div>
        <h1><span className="w"><i>Time</i></span> <span className="w"><i>your</i></span> <span className="w"><i>big</i></span> <span className="w"><i>moves.</i></span><br /><span className="w"><i className="grad">Launch</i></span> <span className="w"><i className="grad">with</i></span> <span className="w"><i className="grad">the</i></span> <span className="w"><i className="grad">stars.</i></span></h1>
        <p className="sub">Find the strongest windows for career changes, launches and decisions over the next 12 months.</p>
        <div className="cta"><a className="btn p mag" href="#">Find My Window →</a><a className="btn g mag" href="#">Talk to Dr. Astra</a></div>
      </div>
      </div>
      <div className="stats" id="stats">
        <div><b data-n="15">0</b><small>Years research</small></div>
        <div><b data-n="12000">0</b><small>Charts read</small></div>
        <div><b data-n="98">0</b><small>% satisfaction</small></div>
      </div>
    </div>

    <div>
      <div className="card" id="c1"><i className="glr"></i>
        <h3>Today’s Planetary Sky</h3><p>Live alignment snapshot</p>
        <div className="row"><span>☉ Sun</span><span className="pill">Scorpio 12°</span></div>
        <div className="row"><span>☽ Moon</span><span className="pill">Taurus 28°</span></div>
        <div className="row"><span>♀ Venus</span><span className="pill">Libra 4°</span></div>
        <p style={{marginTop:'12px'}}>Career window strength</p>
        <div className="bar"><div id="bar"></div></div>
      </div>
      <div className="card s" id="c2"><span className="dot"></span><div><h3>Dr. Astra is online</h3><p>Next free slot: today, 6:30 PM</p></div></div>
    </div>
  </div>
  <div className="cap"><p className="ct">Astronomical data, turned into clear life guidance.</p><p className="cs">Private consultations on relationships, career and wellbeing, explained in plain language.</p></div>
  <div className="obl" id="obl">
    <div className="ob-ic"><span className="ob-c"><svg viewBox="0 0 24 24"><path d="M12 20s-7-4.4-8.6-9C2.3 8 4 5.5 6.8 5.5c1.9 0 3.4 1.1 5.2 3 1.8-1.9 3.3-3 5.2-3 2.8 0 4.5 2.5 3.4 5.5C19 15.6 12 20 12 20z"/></svg></span><small>Relationship</small></div>
    <div className="ob-ic"><span className="ob-c"><svg viewBox="0 0 24 24"><rect x="3" y="8" width="18" height="12" rx="2"/><path d="M9 8V6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M3 13h18"/></svg></span><small>Career</small></div>
    <div className="ob-ic"><span className="ob-c"><svg viewBox="0 0 24 24"><path d="M10 4h4v6h6v4h-6v6h-4v-6H4v-4h6z"/></svg></span><small>Health</small></div>
    <div className="ob-ic"><span className="ob-c"><svg viewBox="0 0 24 24"><path d="M3 5v14h18M6 9l4 4 3-3 5 6M15 16h3v-3"/></svg></span><small>Business</small></div>
  </div>
  <div className="scroll" id="scroll">SCROLL ↓</div>
</section>

    </>
  );
}
