// Simple test component to check if React is working
export default function Simple() {
  console.log("Simple component is rendering!");
  
  return (
    <div style={{ padding: '20px', background: 'white', color: 'black' }}>
      <h1>Hello from Simple Component!</h1>
      <p>If you can see this, React is working.</p>
    </div>
  );
}