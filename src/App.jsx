import { useMemo, useState } from 'react';

const DEMO_KEY = 'SDR-001';
const LABEL_EMAIL = 'SOULDUSTRECORDS@GMAIL.COM';
const DEFAULT_RELEASES = [
  { catalog: 'SDR001', title: 'Impumelelo', upc: '6004262300900', date: '2026-06-11', status: 'Active' },
];

const initialProfileLinks = {
  Spotify: '',
  YouTube: '',
  'Apple Music': '',
  Deezer: '',
};

const performanceLinks = [
  { name: 'Backstage Marketing', url: 'https://backstage-marketing.com/links' },
  { name: 'Believe B2C Login', url: 'https://believeb2c.b2clogin.com/' },
];

const navItems = [
  { id: 'overview', label: 'Overview', icon: '▦' },
  { id: 'releases', label: 'Releases', icon: '♫' },
  { id: 'submission', label: 'New submission', icon: '⇧' },
  { id: 'profiles', label: 'Artist profiles', icon: '◎' },
  { id: 'settings', label: 'Settings', icon: '⚙' },
];

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentPage, setCurrentPage] = useState('overview');
  const [toast, setToast] = useState('');
  const [releases, setReleases] = useState(DEFAULT_RELEASES);
  const [profileLinks, setProfileLinks] = useState(initialProfileLinks);
  const [submissions, setSubmissions] = useState([]);

  const activeProfileCount = useMemo(
    () => Object.values(profileLinks).filter(Boolean).length,
    [profileLinks],
  );

  const showToast = (message) => {
    setToast(message);
    window.clearTimeout(showToast.timer);
    showToast.timer = window.setTimeout(() => setToast(''), 3500);
  };

  const navigate = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogin = (event) => {
    event.preventDefault();
    const key = new FormData(event.currentTarget).get('accessKey') || '';

    if (String(key).trim() === DEMO_KEY) {
      setIsLoggedIn(true);
      showToast('Portal access granted.');
      navigate('overview');
      return;
    }

    showToast('Incorrect access key. Use SDR-001.');
  };

  const handleSignOut = () => {
    setIsLoggedIn(false);
    setCurrentPage('overview');
    showToast('Signed out.');
  };

  const handleProfileSave = () => {
    const next = {
      Spotify: document.getElementById('spotify')?.value.trim() || '',
      YouTube: document.getElementById('youtube')?.value.trim() || '',
      'Apple Music': document.getElementById('apple')?.value.trim() || '',
      Deezer: document.getElementById('deezer')?.value.trim() || '',
    };

    setProfileLinks(next);
    showToast('Artist profile links updated.');
  };

  const handleProfileVerify = () => {
    const values = ['spotify', 'youtube', 'apple', 'deezer']
      .map((id) => document.getElementById(id)?.value.trim())
      .filter(Boolean);

    if (!values.length) {
      showToast('Add at least one platform URL first.');
      return;
    }

    const invalid = values.filter((value) => {
      try {
        const url = new URL(value);
        return !['http:', 'https:'].includes(url.protocol);
      } catch {
        return true;
      }
    });

    showToast(
      invalid.length
        ? `${invalid.length} link(s) need a valid http/https URL.`
        : `${values.length} URL(s) are valid and ready for routing.`
    );
  };

  const handleSubmission = (event) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const releaseData = {
      catalog: String(formData.get('catalogNo') || '').trim(),
      title: String(formData.get('releaseTitle') || '').trim(),
      upc: String(formData.get('upc') || '').trim(),
      date: String(formData.get('releaseDate') || '').trim(),
      status: 'Pending review',
    };

    if (!releaseData.catalog || !releaseData.title || !releaseData.date) {
      showToast('Catalogue number, title and release date are required.');
      return;
    }

    const duplicate = releases.some(
      (release) => release.catalog.toLowerCase() === releaseData.catalog.toLowerCase(),
    );

    if (duplicate) {
      showToast('That catalogue number already exists in this portal.');
      return;
    }

    const trackTitle = String(formData.get('trackTitle') || '').trim();
    const primaryArtist = String(formData.get('primaryArtist') || '').trim();
    const emailBody = [
      'SOUL DUST RECORDS RELEASE SUBMISSION',
      '',
      `Label Name: ${String(formData.get('labelName') || 'Soul Dust Records')}`,
      `Release Title: ${releaseData.title}`,
      `Catalogue Number: ${releaseData.catalog}`,
      `UPC / EAN: ${releaseData.upc || 'Not assigned'}`,
      `Official Release Date: ${releaseData.date}`,
      `Release Year: ${String(formData.get('releaseYear') || 'N/A')}`,
      `Track Number: ${String(formData.get('trackNo') || 'N/A')}`,
      `Track Title: ${trackTitle || 'N/A'}`,
      `Primary Artist(s): ${primaryArtist || 'N/A'}`,
      `Featured Artist(s): ${String(formData.get('featuredArtist') || 'N/A')}`,
      `Genre: ${String(formData.get('genre') || 'N/A')}`,
      `ISRC: ${String(formData.get('isrc') || 'N/A')}`,
      `Explicit Status: ${String(formData.get('explicit') || 'N/A')}`,
      `Composer(s): ${String(formData.get('composers') || 'N/A')}`,
      `Author(s): ${String(formData.get('authors') || 'N/A')}`,
      `Publisher: ${String(formData.get('publisher') || 'N/A')}`,
      `Splits: ${String(formData.get('splits') || 'N/A')}`,
      `Submission Notes: ${String(formData.get('notes') || 'N/A')}`,
      '',
      'This submission was sent from the SDR Artist Administration Portal.',
    ].join('\n');

    const subject = encodeURIComponent(`New release submission: ${releaseData.title}`);
    const body = encodeURIComponent(emailBody);

    window.location.href = `mailto:${LABEL_EMAIL}?subject=${subject}&body=${body}`;

    const nextRelease = { ...releaseData };
    const nextSubmission = { release: nextRelease, track: trackTitle, artist: primaryArtist };

    setReleases((prev) => [nextRelease, ...prev]);
    setSubmissions((prev) => [nextSubmission, ...prev]);
    showToast('Release draft opened in your email client and saved locally.');
    event.currentTarget.reset();
    navigate('releases');
  };

  return (
    <>
      {!isLoggedIn ? (
        <section className="login-screen">
          <form className="login-card" onSubmit={handleLogin}>
            <div className="mark">SDR</div>
            <div className="eyebrow">Artist administration portal</div>
            <h2>Welcome back.</h2>
            <p>Sign in to access the Soul Dust Records portal.</p>
            <div className="field">
              <label htmlFor="accessKey">Access key</label>
              <input id="accessKey" name="accessKey" type="password" placeholder="Enter access key" required autoComplete="current-password" />
            </div>
            <button className="btn primary" type="submit">Sign in securely →</button>
            <div className="demo-note">Production portal access key: <strong>SDR-001</strong></div>
          </form>
        </section>
      ) : (
        <div className="app-shell">
          <div className="shell">
            <header className="topbar">
              <div className="brand">
                <div className="mark">SDR</div>
                <div>
                  <h1>SOUL DUST</h1>
                  <p>RECORDS · ARTIST ADMINISTRATION</p>
                </div>
              </div>
              <div className="top-actions">
                <div className="status">
                  <span className="dot"></span>
                  Workspace connected
                </div>
                <button className="btn ghost" type="button" onClick={handleSignOut}>Sign out</button>
              </div>
            </header>

            <section className="hero">
              <div className="hero-card">
                <div className="eyebrow">SDR admin · v3.0</div>
                <h2>Your music.<br />Managed in one place.</h2>
                <p>
                  Organise releases, artist metadata, platform routing and label submissions from one central workspace.
                </p>
              </div>

              <div className="panel quicklinks">
                <h3>Artist shortcuts ↗</h3>
                <div className="link-list">
                  {performanceLinks.map((link) => (
                    <a key={link.name} className="external" href={link.url} target="_blank" rel="noreferrer">
                      <span>{link.name}</span>
                      <span>↗</span>
                    </a>
                  ))}
                </div>
              </div>
            </section>

            <section className="metrics">
              <div className="metric">
                <div className="label">Total releases</div>
                <div className="value">{releases.length}</div>
                <div className="small">Catalogue entries</div>
              </div>
              <div className="metric">
                <div className="label">Submissions</div>
                <div className="value">{submissions.length}</div>
                <div className="small">Saved in this session</div>
              </div>
              <div className="metric">
                <div className="label">Platform profiles</div>
                <div className="value">{activeProfileCount}/4</div>
                <div className="small">Artist routing links</div>
              </div>
              <div className="metric">
                <div className="label">Workspace</div>
                <div className="value" style={{ fontSize: '22px' }}>LIVE</div>
                <div className="small">Portal ready</div>
              </div>
            </section>

            <div className="layout">
              <aside className="panel sidebar">
                <div className="nav-label">WORKSPACE</div>
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className={`nav-btn ${currentPage === item.id ? 'active' : ''}`}
                    onClick={() => navigate(item.id)}
                  >
                    <span className="ico">{item.icon}</span>
                    {item.label}
                  </button>
                ))}
              </aside>

              <main className="content">
                {currentPage === 'overview' && (
                  <>
                    <section className="panel">
                      <div className="panel-head">
                        <div>
                          <h3>Account summary</h3>
                          <p>At-a-glance view of the release catalogue.</p>
                        </div>
                        <span className="tag">CATALOGUE</span>
                      </div>

                      <div className="table-wrap">
                        <table>
                          <thead>
                            <tr>
                              <th>CATALOG NO.</th>
                              <th>RELEASE TITLE</th>
                              <th>UPC / EAN</th>
                              <th>STATUS</th>
                            </tr>
                          </thead>
                          <tbody>
                            {releases.map((release) => (
                              <tr key={`${release.catalog}-${release.title}`}>
                                <td>{release.catalog}</td>
                                <td>{release.title}</td>
                                <td>{release.upc || '—'}</td>
                                <td>
                                  <span className={`pill ${release.status === 'Pending review' ? 'pending' : ''}`}>
                                    ● {release.status}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </section>

                    <section className="panel">
                      <div className="panel-head">
                        <div>
                          <h3>Artist verification & platform routing</h3>
                          <p>Add official profiles so your artist catalogue can be matched correctly.</p>
                        </div>
                        <span className="tag">4 PLATFORMS</span>
                      </div>

                      <div className="form-grid">
                        <div className="field">
                          <label htmlFor="spotify">Spotify for Artists</label>
                          <input id="spotify" type="url" defaultValue={profileLinks.Spotify} placeholder="https://open.spotify.com/artist/..." />
                        </div>
                        <div className="field">
                          <label htmlFor="youtube">YouTube Official Artist Channel</label>
                          <input id="youtube" type="url" defaultValue={profileLinks.YouTube} placeholder="https://www.youtube.com/channel/..." />
                        </div>
                        <div className="field">
                          <label htmlFor="apple">Apple Music for Artists</label>
                          <input id="apple" type="url" defaultValue={profileLinks['Apple Music']} placeholder="https://music.apple.com/artist/..." />
                        </div>
                        <div className="field">
                          <label htmlFor="deezer">Deezer Backstage</label>
                          <input id="deezer" type="url" defaultValue={profileLinks.Deezer} placeholder="https://backstage.deezer.com/..." />
                        </div>
                      </div>

                      <div className="actions">
                        <button type="button" className="btn primary" onClick={handleProfileSave}>Save profile links</button>
                        <button type="button" className="btn" onClick={handleProfileVerify}>Check entered links</button>
                      </div>
                    </section>
                  </>
                )}

                {currentPage === 'releases' && (
                  <section className="panel">
                    <div className="panel-head">
                      <div>
                        <h3>Release catalogue</h3>
                        <p>Live releases tracked in the portal.</p>
                      </div>
                      <button type="button" className="btn primary" onClick={() => navigate('submission')}>+ New release</button>
                    </div>

                    <div className="table-wrap">
                      <table>
                        <thead>
                          <tr>
                            <th>CATALOG NO.</th>
                            <th>RELEASE TITLE</th>
                            <th>UPC / EAN</th>
                            <th>RELEASE DATE</th>
                            <th>STATUS</th>
                          </tr>
                        </thead>
                        <tbody>
                          {releases.map((release) => (
                            <tr key={`${release.catalog}-${release.title}-list`}>
                              <td>{release.catalog}</td>
                              <td>{release.title}</td>
                              <td>{release.upc || '—'}</td>
                              <td>{release.date || '—'}</td>
                              <td>
                                <span className={`pill ${release.status === 'Pending review' ? 'pending' : ''}`}>
                                  ● {release.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </section>
                )}

                {currentPage === 'submission' && (
                  <form className="panel" onSubmit={handleSubmission}>
                    <div className="panel-head">
                      <div>
                        <h3>Music submission portal</h3>
                        <p>Prepare release information to send to the label.</p>
                      </div>
                      <span className="tag">NEW SUBMISSION</span>
                    </div>

                    <div className="notice">
                      Release submissions open an email draft to {LABEL_EMAIL}. Use this for a static GitHub Pages deployment. For production, connect a backend email service or API endpoint.
                    </div>

                    <div className="upload-grid">
                      <div className="upload">
                        <div className="bigico">🖼️</div>
                        <div>
                          <h4>Upload cover art</h4>
                          <p>3000 × 3000 px · RGB · JPEG or PNG</p>
                          <input type="file" name="coverArt" accept="image/jpeg,image/png" />
                        </div>
                      </div>
                      <div className="upload">
                        <div className="bigico">🎵</div>
                        <div>
                          <h4>Upload audio master</h4>
                          <p>WAV preferred · stereo · 44.1 kHz</p>
                          <input type="file" name="audioFile" accept=".wav,audio/wav,audio/x-wav" />
                        </div>
                      </div>
                    </div>

                    <div className="section-title">01 · Release metadata</div>
                    <div className="form-grid">
                      <div className="field">
                        <label htmlFor="labelName">Label name *</label>
                        <input id="labelName" name="labelName" defaultValue="Soul Dust Records" />
                      </div>
                      <div className="field">
                        <label htmlFor="releaseTitle">Release title *</label>
                        <input id="releaseTitle" name="releaseTitle" placeholder="e.g. Impumelelo EP" required />
                      </div>
                      <div className="field">
                        <label htmlFor="catalogNo">Catalogue number *</label>
                        <input id="catalogNo" name="catalogNo" placeholder="e.g. SDR002" required />
                      </div>
                      <div className="field">
                        <label htmlFor="upc">UPC / EAN barcode</label>
                        <input id="upc" name="upc" inputMode="numeric" placeholder="Leave blank if not assigned" />
                      </div>
                      <div className="field">
                        <label htmlFor="releaseDate">Official release date *</label>
                        <input id="releaseDate" name="releaseDate" type="date" required />
                      </div>
                      <div className="field">
                        <label htmlFor="releaseYear">Release year</label>
                        <input id="releaseYear" name="releaseYear" type="number" min="1900" max="2200" placeholder="2026" />
                      </div>
                      <div className="field">
                        <label htmlFor="pline">P Line</label>
                        <input id="pline" name="pline" placeholder="℗ 2026 Soul Dust Records" />
                      </div>
                      <div className="field">
                        <label htmlFor="cline">C Line</label>
                        <input id="cline" name="cline" placeholder="© 2026 Soul Dust Records" />
                      </div>
                    </div>

                    <div className="section-title">02 · Track metadata</div>
                    <div className="form-grid">
                      <div className="field">
                        <label htmlFor="trackNo">Track number</label>
                        <input id="trackNo" name="trackNo" type="number" min="1" defaultValue="1" />
                      </div>
                      <div className="field">
                        <label htmlFor="trackTitle">Track title *</label>
                        <input id="trackTitle" name="trackTitle" placeholder="Track title" required />
                      </div>
                      <div className="field">
                        <label htmlFor="mixType">Track version / mix type</label>
                        <input id="mixType" name="mixType" placeholder="Original Mix" />
                      </div>
                      <div className="field">
                        <label htmlFor="primaryArtist">Primary artist(s) *</label>
                        <input id="primaryArtist" name="primaryArtist" placeholder="Artist name(s)" required />
                      </div>
                      <div className="field">
                        <label htmlFor="featuredArtist">Featured artist(s)</label>
                        <input id="featuredArtist" name="featuredArtist" placeholder="Optional" />
                      </div>
                      <div className="field">
                        <label htmlFor="remixer">Remixer</label>
                        <input id="remixer" name="remixer" placeholder="Optional" />
                      </div>
                      <div className="field">
                        <label htmlFor="genre">Primary genre *</label>
                        <select id="genre" name="genre" required>
                          <option value="">Choose genre</option>
                          <option>Afro House</option>
                          <option>Afro Tech</option>
                          <option>Gqom</option>
                          <option>GQOMTech</option>
                          <option>Amapiano</option>
                          <option>House</option>
                          <option>Dance</option>
                          <option>Hip-Hop</option>
                          <option>Maskandi</option>
                          <option>Pop</option>
                          <option>Other</option>
                        </select>
                      </div>
                      <div className="field">
                        <label htmlFor="duration">Track duration (MM:SS)</label>
                        <input id="duration" name="duration" placeholder="06:45" />
                      </div>
                      <div className="field">
                        <label htmlFor="isrc">ISRC code</label>
                        <input id="isrc" name="isrc" placeholder="Leave blank if not assigned" />
                      </div>
                      <div className="field">
                        <label htmlFor="explicit">Explicit content status</label>
                        <select id="explicit" name="explicit">
                          <option>Not explicit</option>
                          <option>Explicit</option>
                          <option>Clean edit of explicit track</option>
                          <option>Not yet confirmed</option>
                        </select>
                      </div>
                    </div>

                    <div className="section-title">03 · Publishing, composers & splits</div>
                    <div className="form-grid">
                      <div className="field">
                        <label htmlFor="composers">Composer(s) full legal name(s)</label>
                        <textarea id="composers" name="composers" placeholder="List all composers"></textarea>
                      </div>
                      <div className="field">
                        <label htmlFor="authors">Author(s) / lyricist(s)</label>
                        <textarea id="authors" name="authors" placeholder="List lyricists or write Instrumental"></textarea>
                      </div>
                      <div className="field">
                        <label htmlFor="publisher">Publisher information</label>
                        <input id="publisher" name="publisher" placeholder="Publisher name / details" />
                      </div>
                      <div className="field">
                        <label htmlFor="splits">Performance rights share splits (%)</label>
                        <textarea id="splits" name="splits" placeholder="Name — 50%; Name — 50%"></textarea>
                      </div>
                      <div className="field full">
                        <label htmlFor="notes">Special instructions / submission notes</label>
                        <textarea id="notes" name="notes" placeholder="Anything the label should know"></textarea>
                      </div>
                    </div>

                    <div className="actions">
                      <button type="submit" className="btn primary">Send release to label</button>
                      <button type="reset" className="btn">Clear form</button>
                    </div>
                  </form>
                )}

                {currentPage === 'profiles' && (
                  <section className="panel">
                    <div className="panel-head">
                      <div>
                        <h3>Artist platform profiles</h3>
                        <p>Manage the links used to identify the artist across services.</p>
                      </div>
                    </div>

                    <div className="empty">
                      {activeProfileCount > 0 ? (
                        <div>
                          {Object.entries(profileLinks)
                            .filter(([, value]) => value)
                            .map(([name, value]) => (
                              <p key={name}>
                                <strong>{name}:</strong>{' '}
                                <a href={value} target="_blank" rel="noreferrer" style={{ color: 'var(--gold)', overflowWrap: 'anywhere' }}>
                                  {value}
                                </a>
                              </p>
                            ))}
                        </div>
                      ) : (
                        'No platform links saved yet.'
                      )}
                    </div>
                    <button type="button" className="btn primary" onClick={() => navigate('overview')}>Manage profile links</button>
                  </section>
                )}

                {currentPage === 'settings' && (
                  <section className="panel">
                    <div className="panel-head">
                      <div>
                        <h3>Settings & security</h3>
                        <p>Key operational notes before production launch.</p>
                      </div>
                      <span className="tag">PORTAL MODE</span>
                    </div>

                    <div className="notice">
                      Static GitHub Pages deployments are frontend-only. For production, replace the mailto flow with a secure server-side API or webhook endpoint.
                    </div>

                    <div className="section-title">Production checklist</div>
                    <div className="field">
                      <label><input type="checkbox" disabled /> Supabase authentication enabled</label>
                    </div>
                    <div className="field">
                      <label><input type="checkbox" disabled /> Database row-level security configured</label>
                    </div>
                    <div className="field">
                      <label><input type="checkbox" disabled /> Private file storage and upload validation deployed</label>
                    </div>
                    <div className="field">
                      <label><input type="checkbox" disabled /> API endpoint for release delivery configured</label>
                    </div>
                    <div className="field">
                      <label><input type="checkbox" disabled /> Privacy notice and retention policies reviewed</label>
                    </div>

                    <div className="section-title">Recommended architecture</div>
                    <p style={{ color: 'var(--muted)', fontSize: '13px' }}>
                      GitHub Pages frontend · Supabase Auth + Postgres · private storage or Drive workflow · server-side email delivery.
                    </p>
                  </section>
                )}
              </main>
            </div>
          </div>

          <div className="footer">SOUL DUST RECORDS · Artist Administration Portal · production-ready frontend prototype</div>
          {toast && <div className="toast" role="status">{toast}</div>}
        </div>
      )}
    </>
  );
}

export default App;
