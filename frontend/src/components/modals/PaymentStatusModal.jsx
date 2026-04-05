import React from 'react';
import UniversalPopup from '../common/UniversalPopup';
import PaymentStatusContent from '../common/PaymentStatusContent';

const PaymentStatusModal = ({
    isOpen,
    onClose,
    tier,
    status = 'success',
    planId
}) => {
    if (!isOpen) return null;

    const handleClose = () => {
        onClose();
        const isSuccess = status === 'success';
        const isRefunded = status === 'refunded';
        const isTopup = planId?.startsWith('topup_') || ['quick_boost', 'power_pack', 'pro_master', 'student_test'].includes(planId);

        if (isSuccess && !isRefunded && !isTopup) {
            if (window.location.pathname !== '/dashboard') {
                window.location.href = '/dashboard';
            } else {
                window.location.reload();
            }
        }
    };

    return (
        <UniversalPopup
            isOpen={isOpen}
            onClose={handleClose}
            maxWidth="max-w-sm"
            padding="p-0"
            showClose={true}
        >
            <PaymentStatusContent 
                tier={tier}
                status={status}
                planId={planId}
                onClose={handleClose}
                isModal={true}
            />
        </UniversalPopup>
    );
};

export default PaymentStatusModal;

