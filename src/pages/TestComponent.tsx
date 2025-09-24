// Simple test component to debug rendering
export default function TestComponent() {
  console.log("TestComponent is rendering!");
  
  return (
    <div style={{ 
      padding: '20px', 
      backgroundColor: 'white', 
      color: 'black',
      fontSize: '20px',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1>🟢 React is Working!</h1>
      <p>If you can see this, React is rendering successfully.</p>
      <p>Current time: {new Date().toLocaleString()}</p>
      <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#f0f0f0' }}>
        <h2>Debug Info:</h2>
        <ul>
          <li>React: ✅ Working</li>
          <li>Routing: ✅ Working</li>
          <li>Component: ✅ TestComponent</li>
        </ul>
      </div>
    </div>
  );
}