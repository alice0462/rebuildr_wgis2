import './App.css';

function App() {
  return (
    <div className="app">
      <div id = "background"> 
        <div id="profile-pic">
          Profile pic
        </div>
        <div id="user-name">
          User name
        </div>
        
        <div id="body">
          <div className="stats">
            <div id="rank">
              Rank
            </div>
            <div id="co2">
              Emission
            </div>
            <div id="reviews">
              Reviews
            </div>

          </div>
          <div id = "treeBox">
            <img src="/tree.svg" alt="Tree" id='tree'/>
          </div>
          <div id = "curiosa">
            Curiosa
          </div>
        </div>
        
      </div>
    </div>
  );
}

export default App;