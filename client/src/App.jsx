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

  useEffect(() => {
    if (contract) {
      fetchFruits();
    }
  }, [contract]);

  return (
    <div style={{ padding: "2rem" }}>
      {!account ? (
        <button onClick={connectWallet}>Connect Wallet</button>
      ) : (
        <p>Connected: {account}</p>
      )}

      <h2>Fruits Available</h2>
      <ul>
        {fruits.map((fruit, index) => (
          <li key={index} style={{ marginBottom: "1rem" }}>
            <strong>Name:</strong> {fruit.name} <br />
            <strong>Price:</strong> {ethers.formatEther(fruit.price)} ETH <br />
            <strong>Seller:</strong> {fruit.seller} <br />
            <strong>Status:</strong>{" "}
            {fruit.buyer === "0x0000000000000000000000000000000000000000" ? (
              <button onClick={() => buyFruit(index, fruit.price)}>Buy</button>
            ) : (
              "Sold"
            )}
          </li>
        ))}
      </ul>

      <h2>Add a New Fruit</h2>
      <input
        type="text"
        placeholder="Fruit Name"
        value={newFruitName}
        onChange={(e) => setNewFruitName(e.target.value)}
        style={{ marginRight: "1rem" }}
      />
      <input
        type="text"
        placeholder="Price (in ETH)"
        value={newFruitPrice}
        onChange={(e) => setNewFruitPrice(e.target.value)}
        style={{ marginRight: "1rem" }}
      />
      <button onClick={addFruit}>Add Fruit</button>
    </div>
  );
}

export default App;