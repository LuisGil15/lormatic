import React, {useState} from "react";
import Button from "../components/atoms/Button";
import Modal from "../components/molecules/Modal";
import GameSettings from "../components/molecules/GameSettings";

import logo from '../assets/images/logo.png';

import '../assets/styles/pages/Home.css'

const Home = () => {
    const [showModal, setShowModal] = useState(false);

    const openModal = () => setShowModal(true);
    const closeModal = () => setShowModal(false);

    // const handleStartGame = ({ players, difficulty }) => {
    //   // Aquí puedes manejar la lógica cuando se inicie un nuevo juego con las configuraciones seleccionadas.
    //   console.log(
    //     `Starting game with ${players} players and ${difficulty} difficulty.`
    //   );
    //   closeModal();
    // };

    return (
        <div className="home-container">
            <div className="button-section">
                <img src={logo} alt="Logo" className="logo"/>
                <Button show={showModal} className="start-button" onClick={openModal}>START</Button>
            </div>
            <Modal show={showModal} onClose={closeModal}>
                <GameSettings />
            </Modal>
        </div>
    );
};

export default Home;
