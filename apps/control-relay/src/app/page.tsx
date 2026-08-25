export default function ControlRelayHome() {
  return (
    <main>
      <h1>UTL Control Relay POC</h1>
      <p>Isolated communication relay endpoint.</p>
      <ul>
        <li><code>GET /ping</code> — Health check</li>
        <li><code>POST /ping</code> — Message verification</li>
      </ul>
    </main>
  );
}
