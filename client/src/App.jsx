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
  const [priceUpdates, setPriceUpdates] = useState({});
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState("success"); // "success" or "danger"

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

  const clearMessageAfterDelay = () => {
    setTimeout(() => {
      setMessage(null);
    }, 5000);
  };

  const addFruit = async () => {
    if (!newFruitName || !newFruitPrice) return;
    try {
      const priceInWei = ethers.parseEther(newFruitPrice);
      const tx = await contract.addFruit(newFruitName, priceInWei);
      await tx.wait();
      setNewFruitName("");
      setNewFruitPrice("");
      setMessage("Fruit added successfully!");
      setMessageType("success");
      fetchFruits();
    } catch (error) {
      console.error("Error adding fruit:", error);
      setMessage("Failed to add fruit.");
      setMessageType("danger");
    }
    clearMessageAfterDelay();
  };

  const buyFruit = async (index, price) => {
    try {
      const tx = await contract.buyFruit(index, { value: price });
      await tx.wait();
      setMessage("Fruit purchased successfully!");
      setMessageType("success");
      fetchFruits();
    } catch (error) {
      console.error("Error buying fruit:", error);
      setMessage("Failed to buy fruit.");
      setMessageType("danger");
    }
    clearMessageAfterDelay();
  };

  const updateFruitPrice = async (e, index) => {
    e.preventDefault();
    if (!priceUpdates[index]) {
      setMessage("Please enter a new price.");
      setMessageType("danger");
      clearMessageAfterDelay();
      return;
    }
    try {
      const newPriceInWei = ethers.parseEther(priceUpdates[index]);
      const tx = await contract.setFruitPrice(index, newPriceInWei);
      await tx.wait();
      setMessage("Price updated successfully!");
      setMessageType("success");
      fetchFruits();
    } catch (error) {
      console.error("Error updating price:", error);
      setMessage("Failed to update price.");
      setMessageType("danger");
    }
    clearMessageAfterDelay();
  };

  const handleRateSeller = async (e, index) => {
    e.preventDefault();
    if (!ratings[index]) {
      setMessage("Please select a rating first.");
      setMessageType("danger");
      clearMessageAfterDelay();
      return;
    }
  
    try {
      const tx = await contract.rateSeller(index, parseInt(ratings[index]));
      await tx.wait();
      setMessage("Rating submitted successfully!");
      setMessageType("success");
      fetchFruits(); // refresh if needed
    } catch (error) {
      console.error("Error rating seller:", error);
      setMessage("Failed to rate seller.");
      setMessageType("danger");
    }
    clearMessageAfterDelay();
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
          {message && (
            <div className={`alert alert-${messageType} mt-3`} role="alert">
              {message}
            </div>
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
            .map((fruit, realIndex) => ({ fruit, realIndex })) // decorate each fruit with its real index
            .filter(({ fruit }) => fruit.buyer === "0x0000000000000000000000000000000000000000")
            .map(({ fruit, realIndex }) => (
              <div key={realIndex} className="col-md-6 mb-4">
                <div className="card h-100">
                  <div className="card-body">
                    <h5 className="card-title">{fruit.name}</h5>
                    <p className="card-text">
                      <strong>Price:</strong> {ethers.formatEther(fruit.price)} ETH<br />
                      <strong>Seller:</strong> {fruit.seller}<br />
                    </p>
                    <button className="btn btn-success mt-2" onClick={() => buyFruit(realIndex, fruit.price)}>Buy</button>
            
                    {account && account.toLowerCase() === fruit.seller.toLowerCase() && (
                      <form onSubmit={(e) => updateFruitPrice(e, realIndex)} className="mt-2">
                        <div className="input-group">
                          <input
                            type="text"
                            className="form-control"
                            placeholder="New Price (ETH)"
                            value={priceUpdates[realIndex] || ""}
                            onChange={(e) => setPriceUpdates({ ...priceUpdates, [realIndex]: e.target.value })}
                          />
                          <button className="btn btn-warning" type="submit">Update Price</button>
                        </div>
                      </form>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <h2 className="text-center mt-5">Marketplace - Sold Fruits</h2>
          <div className="row">
          {fruits
            .map((fruit, realIndex) => ({ fruit, realIndex })) // decorate first
            .filter(({ fruit }) => fruit.buyer !== "0x0000000000000000000000000000000000000000") // filter sold fruits
            .map(({ fruit, realIndex }) => (
              <div key={realIndex} className="col-md-6 mb-4">
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
                      <form onSubmit={(e) => handleRateSeller(e, realIndex)} className="mt-2">
                        <div className="input-group">
                          <select
                            className="form-select"
                            value={ratings[realIndex] || ""}
                            onChange={(e) => setRatings({ ...ratings, [realIndex]: e.target.value })}
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