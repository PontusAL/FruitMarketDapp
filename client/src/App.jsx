import 'bootstrap/dist/css/bootstrap.min.css';
import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { contractAddress, contractABI } from "./utils/contract";

function App() {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState(null);
  const [fruits, setFruits] = useState([]);
  const [newFruitName, setNewFruitName] = useState("");
  const [newFruitPrice, setNewFruitPrice] = useState("");
  const [ratings, setRatings] = useState({});

  const connectWallet = async () => {
    if (!window.ethereum) return alert("Please install MetaMask");

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const address = await signer.getAddress();
    const contract = new ethers.Contract(contractAddress, contractABI, signer);

    setProvider(provider);
    setSigner(signer);
    setAccount(address);
    setContract(contract);
  };

  const fetchFruits = async () => {
    if (!contract) return;
    const fruits = await contract.getFruits();
    setFruits(fruits);
  };

  const addFruit = async () => {
    if (!newFruitName || !newFruitPrice) return;
    const priceInWei = ethers.parseEther(newFruitPrice);
    const tx = await contract.addFruit(newFruitName, priceInWei);
    await tx.wait();
    setNewFruitName("");
    setNewFruitPrice("");
    fetchFruits();
  };

  const buyFruit = async (index, price) => {
    try {
      const tx = await contract.buyFruit(index, { value: price });
      await tx.wait();
      fetchFruits();
    } catch (error) {
      console.error("Error buying fruit:", error);
    }
  };

  const handleRateSeller = async (e, index) => {
    e.preventDefault();
    if (!ratings[index]) return alert("Please select a rating first.");
  
    try {
      const tx = await contract.rateSeller(index, parseInt(ratings[index]));
      await tx.wait();
      alert("Rating submitted successfully!");
      fetchFruits(); // refresh if needed
    } catch (error) {
      console.error("Error rating seller:", error);
      alert("Failed to rate seller.");
    }
  };

  useEffect(() => {
    if (contract) {
      fetchFruits();
    }
  }, [contract]);

  return (
    <div style={{ 
      backgroundColor: "#d4edda", 
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "flex-start",
      padding: "2rem",
    }}>
      <div style={{ 
        width: "100%", 
        maxWidth: "800px", 
        backgroundColor: "#d4edda",
        border: "10px solid #a4c2a8",
        padding: "2rem",
        borderRadius: "8px",
      }}>
        <header className="text-center mb-5">
          {!account ? (
            <button onClick={connectWallet} className="btn btn-primary">Connect Wallet</button>
          ) : (
            <p>Connected: {account}</p>
          )}
        </header>

        <section className="mb-5">
          <h2 className="text-center">Add a New Fruit</h2>
          <div className="input-group mb-3">
            <input
              type="text"
              className="form-control"
              placeholder="Fruit Name"
              value={newFruitName}
              onChange={(e) => setNewFruitName(e.target.value)}
            />
            <input
              type="text"
              className="form-control"
              placeholder="Price (in ETH)"
              value={newFruitPrice}
              onChange={(e) => setNewFruitPrice(e.target.value)}
            />
            <button className="btn btn-primary" onClick={addFruit}>
              Add Fruit
            </button>
          </div>
        </section>

        <section>
          <h2 className="text-center">Marketplace - Available Fruits</h2>
          <div className="row">
            {fruits
              .filter(fruit => fruit.buyer === "0x0000000000000000000000000000000000000000")
              .map((fruit, index) => (
                <div key={index} className="col-md-6 mb-4">
                  <div className="card h-100">
                    <div className="card-body">
                      <h5 className="card-title">{fruit.name}</h5>
                      <p className="card-text">
                        <strong>Price:</strong> {ethers.formatEther(fruit.price)} ETH<br />
                        <strong>Seller:</strong> {fruit.seller}<br />
                      </p>
                      <button className="btn btn-success mt-2" onClick={() => buyFruit(index, fruit.price)}>Buy</button>
                    </div>
                  </div>
                </div>
              ))}
          </div>

          <h2 className="text-center mt-5">Marketplace - Sold Fruits</h2>
          <div className="row">
            {fruits
              .filter(fruit => fruit.buyer !== "0x0000000000000000000000000000000000000000")
              .map((fruit, index) => (
                <div key={index} className="col-md-6 mb-4">
                  <div className="card h-100 bg-light">
                    <div className="card-body">
                      <h5 className="card-title">{fruit.name}</h5>
                      <p className="card-text">
                        <strong>Price:</strong> {ethers.formatEther(fruit.price)} ETH<br />
                        <strong>Seller:</strong> {fruit.seller}<br />
                        <strong>Buyer:</strong> {fruit.buyer}
                      </p>
                      <span className="badge bg-secondary">Sold</span>

                      {account && account.toLowerCase() === fruit.buyer.toLowerCase() && (
                        <form onSubmit={(e) => handleRateSeller(e, index)} className="mt-2">
                          <div className="input-group">
                            <select
                              className="form-select"
                              value={ratings[index] || ""}
                              onChange={(e) => setRatings({ ...ratings, [index]: e.target.value })}
                            >
                              <option value="">Rate Seller</option>
                              <option value="1">1 ⭐</option>
                              <option value="2">2 ⭐⭐</option>
                              <option value="3">3 ⭐⭐⭐</option>
                              <option value="4">4 ⭐⭐⭐⭐</option>
                              <option value="5">5 ⭐⭐⭐⭐⭐</option>
                            </select>
                            <button className="btn btn-primary" type="submit">Submit</button>
                          </div>
                        </form>
                      )}

                    </div>
                  </div>
                </div>
              ))}
          </div>
        </section>
      </div>
    </div>
  );
}

export default App;