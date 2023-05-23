import {TestToComponent} from './demo.js';
// Creating Demo Components //


//Component For Default Export
function TestComponent() {
  return <h1>This is Test Component</h1>;
}

//Component For Named Export
export function Second() {
  return (
    <>
      <h5>Second component</h5>
      <div className='flex'>
      <button>Hit me</button>
      <TestToComponent />
      </div>
    
    </>

  );
}
export default TestComponent;
