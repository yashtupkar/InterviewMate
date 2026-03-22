import React from "react";
import Lottie from "lottie-react";
import discoverAnimation from "../../assets/lottie/Empty State.json";

const EmptyState = ({ message }) => {
    return (
        <div className="flex flex-col items-center justify-center  px-6">
            <div className="w-72 ">
                <Lottie animationData={discoverAnimation} loop={true} />
            </div>
            <p className="text-zinc-500 font-medium text-lg capitalize">{message}</p>
        </div>
    );
};

export default EmptyState;
