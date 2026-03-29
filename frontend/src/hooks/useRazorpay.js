import { useState, useCallback } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth, useUser } from '@clerk/clerk-react';

const RAZORPAY_SCRIPT_URL = 'https://checkout.razorpay.com/v1/checkout.js';

// Loads the Razorpay checkout.js script once and caches it
const loadRazorpayScript = () =>
    new Promise((resolve) => {
        if (document.querySelector(`script[src="${RAZORPAY_SCRIPT_URL}"]`)) {
            resolve(true);
            return;
        }
        const script = document.createElement('script');
        script.src = RAZORPAY_SCRIPT_URL;
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });

/**
 * useRazorpay — handles the full payment lifecycle:
 *   1. Load Razorpay script
 *   2. Call backend to create order
 *   3. Open Razorpay modal
 *   4. On success, verify with backend
 *   5. Expose requestRefund helper
 */
const useRazorpay = ({ onPaymentSuccess, onPaymentFailure } = {}) => {
    const { getToken } = useAuth();
    const { user } = useUser();
    const [isLoading, setIsLoading] = useState(false);

    /**
     * Initiates a payment for a given planId.
     * @param {string} planId - must match a key in PLAN_CONFIG on the backend
     */
    const initiatePayment = useCallback(async (planId) => {
        setIsLoading(true);

        try {
            // Step 1: Load Razorpay script
            const scriptLoaded = await loadRazorpayScript();
            if (!scriptLoaded || !window.Razorpay) {
                toast.error('Failed to load payment gateway. Please check your connection.');
                setIsLoading(false);
                return;
            }

            const token = await getToken();
            const authHeaders = { Authorization: `Bearer ${token}` };

            // Step 2: Create order on backend — server sets the real amount
            let orderData;
            try {
                const res = await axios.post(
                    `${import.meta.env.VITE_BACKEND_URL}/api/subscription/create-order`,
                    { planId },
                    { headers: authHeaders }
                );
                orderData = res.data;
            } catch (err) {
                const msg = err.response?.data?.message || 'Failed to create order. Please try again.';
                toast.error(msg);
                setIsLoading(false);
                return;
            }

            // Step 3: Open Razorpay Checkout Modal
            const options = {
                key: orderData.key,
                amount: orderData.amountPaise,
                currency: orderData.currency,
                name: 'PlaceMateAI',
                image:"https://res.cloudinary.com/dmuldbzko/image/upload/v1774767725/logo_wunfoq.png",
                description: orderData.planName,
                order_id: orderData.razorpayOrderId,
                prefill: {
                    name: `${user?.firstName || ''} ${user?.lastName || ''}`.trim(),
                    email: user?.primaryEmailAddress?.emailAddress || '',
                },
                theme: {
                    color: '#bef264',  // PlaceMateAI brand color
                },
                modal: {
                    ondismiss: () => {
                        // removed cancelled toast to avoid noise with modal
                        setIsLoading(false);
                    },
                },
                // Step 4: On successful payment, send to backend for verification
                handler: async (response) => {
                    try {
                        const verifyRes = await axios.post(
                            `${import.meta.env.VITE_BACKEND_URL}/api/subscription/verify-payment`,
                            {
                                razorpayOrderId: response.razorpay_order_id,
                                razorpayPaymentId: response.razorpay_payment_id,
                                razorpaySignature: response.razorpay_signature,
                                planId,
                            },
                            { headers: authHeaders }
                        );

                        // removed success toast here in favor of modal in parent
                        onPaymentSuccess?.(verifyRes.data);
                    } catch (err) {
                        const msg = err.response?.data?.message || 'Payment verification failed. Please contact support.';
                        toast.error(msg);
                        onPaymentFailure?.(err);
                    } finally {
                        setIsLoading(false);
                    }
                },
            };

            const rzp = new window.Razorpay(options);

            // Handle payment errors from the Razorpay modal itself
            rzp.on('payment.failed', (response) => {
                const errDesc = response.error?.description || 'Payment failed';
                toast.error(`Payment failed: ${errDesc}`);
                onPaymentFailure?.(response.error);
                setIsLoading(false);
            });

            rzp.open();
        } catch (err) {
            console.error('[useRazorpay] Unexpected error:', err);
            // keep this for unexpected errors only
            toast.error('Something went wrong. Please try again.');
            setIsLoading(false);
        }
    }, [getToken, user, onPaymentSuccess, onPaymentFailure]);

    /**
     * Requests a refund for the most recent paid order.
     * Backend validates 24h window + <10% usage before issuing via Razorpay API.
     * @returns {Promise<boolean>} true if refund was successfully initiated
     */
    const requestRefund = useCallback(async () => {
        setIsLoading(true);
        try {
            const token = await getToken();
            const res = await axios.post(
                `${import.meta.env.VITE_BACKEND_URL}/api/subscription/request-refund`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
            // removed success toast here
            onPaymentSuccess?.({ status: 'refunded', message: res.data.message }); // trigger subscription refresh
            return true;
        } catch (err) {
            const msg = err.response?.data?.message || 'Refund request failed. Please try again.';
            toast.error(msg);
            return false;
        } finally {
            setIsLoading(false);
        }
    }, [getToken, onPaymentSuccess]);

    return { initiatePayment, requestRefund, isLoading };
};

export default useRazorpay;
