import abi from "../utils/BuyMeACoffee.json"
import { ethers } from "ethers";
import { useEffect, useState } from "react";
import Head from "next/head";
import { IMemo } from "@/model/memo";
import moment from "moment";
import coffeeImage from "/public/image/590749.png"
const Index = () => {

  const contractAddress = "0x3dc5eB9F1b78760d322CBc5A4d81F7559459a75d"
  const contractABI = abi.abi
  const [currentAccount, setCurrentAccount] = useState("");
  const [name, setName] = useState("");
  const [coffee, setCoffee] = useState(1);
  const [message, setMessage] = useState("");
  const [loadBuy, setLoadBuy] = useState(false);
  const [memos, setMemos] = useState<IMemo[]>([]);


  const onNewMemo = (from:string, timestamp:any, name:string, message:string) => {
    console.log("Memo received: ", from, timestamp, name, message);
    setMemos((prevState) => [ 
      ...prevState,
      {
        address: from,
        time: new Date(timestamp * 1000),
        message,
        name
      }
    ]);
  };
  const isWalletConnected = async () => {
    try {
      const { ethereum } = window;

      const accounts = await ethereum.request({method: 'eth_accounts'})
      console.log("accounts: ", accounts);

      if (accounts.length > 0) {
        const account = accounts[0];
        console.log("wallet is connected! " + account);
      } else {
        console.log("make sure MetaMask is connected");
      }
    } catch (error) {
      console.log("error: ", error);
    }
  }

  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("please install MetaMask");
      }

      const accounts = await ethereum.request({
        method: 'eth_requestAccounts'
      });

      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error);
    }
  }

  const buyACoffee = async () => {
    try {
  const { ethereum } = window;
      if(!name || !message) {
        alert("Name and Message requiert") 
      return
    }
      if(!ethereum) return
      const provider = new ethers.providers.Web3Provider(ethereum) 
      const signer = provider.getSigner()
      const contract = new ethers.Contract(contractAddress, contractABI,signer)
      setLoadBuy(true)
      const coffeeTxn = await contract.buyCoffee(name,message,{value: ethers.utils.parseEther(`${0.001*coffee}`)})
      await coffeeTxn.wait()
      console.log("mind", coffeeTxn.hash)
      setLoadBuy(false)

    } catch (error) {
      console.log(error)
      setLoadBuy(false)
    }
  }

  const getMemos = async () => {
    try {
      const { ethereum } = window;
      if(!ethereum) return 

      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(
        contractAddress,
        contractABI,
        signer
      );

      const memos = await contract.getMemos()
      setMemos(memos )
    } catch (error) {
      
    }
  }

  useEffect(()=> {
    let buyMeACoffee: any
    isWalletConnected()
    getMemos()
    const { ethereum } = window;

    if(!ethereum) return
    const provider = new ethers.providers.Web3Provider(ethereum)
    const signer = provider.getSigner();
    buyMeACoffee = new ethers.Contract(
      contractAddress,
      contractABI,
      signer
    );
    buyMeACoffee.on("NewMemo", onNewMemo);
    return () => {
      if (buyMeACoffee) {
        buyMeACoffee.off("NewMemo", onNewMemo);
      }
    }

  },[])

  return (
    <>
    <Head>
      <title>Buy Me a Coffee!</title>
    </Head>

    <div className="container mx-auto" >
      <h1 className="py-6 text-xl font-bold">
        Buy Me a Coffee!
      </h1>
      
      {currentAccount ? (
        <div>
          <div className="w-1/2 flex flex-col gap-3">
            <div>
              <label htmlFor="name">
                Your Name
              </label>
              <input
                className="border p-2 w-full"
                id="name"
                type="text"
                placeholder="Name"
                onChange={(event) => setName(event.target.value)}
                />
            </div>
            <div>
              <label htmlFor="message">
                Send a message
              </label>
              <textarea
                rows={3}
                className="border p-2 w-full"
                placeholder="Enjoy your coffee!"
                id="message"
                onChange={(event) => setMessage(event.target.value)}
                required
              >
              </textarea> 
            </div>
            <div className="grid grid-cols-8 gap-3">
              <button
                className="text-cyan-800 border py-2 px-3 font-bold border-cyan-800 col-span-5"
                type="button"
                onClick={buyACoffee}
              >
                Send {coffee} Coffee for {(0.001*coffee).toFixed(3)}ETH
              </button>
              <button className="text-cyan-800 border py-2 px-3 font-bold border-cyan-800 disabled:bg-gray-500" onClick={() => setCoffee(coffee-1)} disabled={coffee <= 1}>-</button>
            <input
                className="border p-2 w-full"
                id="coffee"
                type="number"
                min={1}
                value={coffee}
                onChange={(event) => setCoffee(Number.parseInt(event.target.value))}
                />
              <button 
              className="text-cyan-800 border py-2 px-3 font-bold border-cyan-800 "
                onClick={() => setCoffee(coffee+1)}
                >+</button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col justify-center">
          <div className="pt-5"> 
            <button onClick={connectWallet} className="text-cyan-800 border py-2 px-3 font-bold border-cyan-800">Connect your wallet </button>
          </div>
        </div>
      )}
    </div>
    <hr className="my-12 border-2 border-black"/>
<div className="container mx-auto" >
  <h1 className="text-center text-xl font-bold">Memos received</h1>
  {loadBuy && <div className="flex flex-col justify-center">
    <div className=" mx-auto animate-spin">
      <img src={coffeeImage.src} className="w-12 h-12" alt="load" />
      </div>
    </div>
  }
  
  <div className="flex flex-col justify-center">
    {(memos?.map((memo, idx) => {
      return (
        <div key={idx} className="border border-black mt-3 w-full p-6">
          <div className="flex"><span className="font-bold pr-1">{memo.name}</span> ({moment(memo.time).format('dd DD.MM.YYYY')}) </div>
          <p>Message:</p>
          <p>{memo.message}</p>
        </div>
      )
    }))}
    </div>
</div>
  </>
  );
};

export default Index;
