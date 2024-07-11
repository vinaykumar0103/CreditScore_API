// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

contract CreditScore is Ownable {

    struct UserCreditInfo {
        uint256 transactionVolume;
        uint256 walletBalance;
        uint256 transactionFrequency;
        uint256 transactionMix;
        uint256 newTransactions;
        uint256 creditScore;
    }

    mapping(address => UserCreditInfo) public userCredits;

    // Constants for weightings (in percentage)
    uint256 private constant TRANSACTION_VOLUME_WEIGHT = 35;
    uint256 private constant WALLET_BALANCE_WEIGHT = 30;
    uint256 private constant TRANSACTION_FREQUENCY_WEIGHT = 15;
    uint256 private constant TRANSACTION_MIX_WEIGHT = 10;
    uint256 private constant NEW_TRANSACTIONS_WEIGHT = 10;

    // Constants for the credit score range
    uint256 private constant MIN_SCORE = 300;
    uint256 private constant MAX_SCORE = 850;

    // Events for logging updates
    event CreditScoreUpdated(address indexed user, uint256 newCreditScore);

    /**
     * @dev Initializes the contract setting the deployer as the initial owner.
     */
    constructor() Ownable(msg.sender) {}

    /**
     * @dev Updates the transaction volume for the caller's credit info and recalculates the credit score.
     * @param volume The new transaction volume.
     */
    function updateTransactionVolume(uint256 volume) external {
        UserCreditInfo storage info = userCredits[msg.sender];
        info.transactionVolume = volume;
        _updateCreditScore(msg.sender);
    }

    /**
     * @dev Updates the wallet balance for the caller's credit info and recalculates the credit score.
     * @param balance The new wallet balance.
     */
    function updateWalletBalance(uint256 balance) external {
        UserCreditInfo storage info = userCredits[msg.sender];
        info.walletBalance = balance;
        _updateCreditScore(msg.sender);
    }

    /**
     * @dev Updates the transaction frequency for the caller's credit info and recalculates the credit score.
     * @param frequency The new transaction frequency.
     */
    function updateTransactionFrequency(uint256 frequency) external {
        UserCreditInfo storage info = userCredits[msg.sender];
        info.transactionFrequency = frequency;
        _updateCreditScore(msg.sender);
    }

    /**
     * @dev Updates the transaction mix for the caller's credit info and recalculates the credit score.
     * @param mix The new transaction mix.
     */
    function updateTransactionMix(uint256 mix) external {
        UserCreditInfo storage info = userCredits[msg.sender];
        info.transactionMix = mix;
        _updateCreditScore(msg.sender);
    }

    /**
     * @dev Updates the pursuit of new transactions for the caller's credit info and recalculates the credit score.
     * @param newTx The new pursuit of new transactions.
     */
    function updateNewTransactions(uint256 newTx) external {
        UserCreditInfo storage info = userCredits[msg.sender];
        info.newTransactions = newTx;
        _updateCreditScore(msg.sender);
    }

    /**
     * @dev Integrates data from external sources to update a user's credit info and recalculates the credit score.
     * @param user The address of the user.
     * @param volume The new transaction volume.
     * @param balance The new wallet balance.
     * @param frequency The new transaction frequency.
     * @param mix The new transaction mix.
     * @param newTx The new pursuit of new transactions.
     */
    function integrateExternalData(address user, uint256 volume, uint256 balance, uint256 frequency, uint256 mix, uint256 newTx) external onlyOwner {
        UserCreditInfo storage info = userCredits[user];
        info.transactionVolume = volume;
        info.walletBalance = balance;
        info.transactionFrequency = frequency;
        info.transactionMix = mix;
        info.newTransactions = newTx;
        _updateCreditScore(user);
    }

    /**
     * @dev Internal function to calculate and update the credit score based on weighted components.
     * @param user The address of the user.
     */
    function _updateCreditScore(address user) internal {
        UserCreditInfo storage info = userCredits[user];

        // Normalize individual components to fit within a reasonable range (e.g., 0-100)
        uint256 normalizedTransactionVolume = info.transactionVolume > 0 ? info.transactionVolume / 10 : 0;
        uint256 normalizedWalletBalance = info.walletBalance > 0 ? info.walletBalance / 10 : 0;
        uint256 normalizedTransactionFrequency = info.transactionFrequency > 0 ? info.transactionFrequency / 10 : 0;
        uint256 normalizedTransactionMix = info.transactionMix > 0 ? info.transactionMix / 10 : 0;
        uint256 normalizedNewTransactions = info.newTransactions > 0 ? info.newTransactions / 10 : 0;

        // Calculate the weighted score with normalized components
        uint256 weightedScore = (normalizedTransactionVolume * TRANSACTION_VOLUME_WEIGHT / 100) +
                                (normalizedWalletBalance * WALLET_BALANCE_WEIGHT / 100) +
                                (normalizedTransactionFrequency * TRANSACTION_FREQUENCY_WEIGHT / 100) +
                                (normalizedTransactionMix * TRANSACTION_MIX_WEIGHT / 100) +
                                (normalizedNewTransactions * NEW_TRANSACTIONS_WEIGHT / 100);

        // Ensure the weighted score is within 0-100 range before scaling
        if (weightedScore > 100) {
            weightedScore = 100;
        }

        // Scale the weighted score to the credit score range
        info.creditScore = (weightedScore * (MAX_SCORE - MIN_SCORE) / 100) + MIN_SCORE;

        // Emit event for logging
        emit CreditScoreUpdated(user, info.creditScore);
    }

    /**
     * @dev Returns the credit score of a user.
     * @param user The address of the user.
     * @return The credit score of the user.
     */
    function getCreditScore(address user) public view returns (uint256) {
        return userCredits[user].creditScore;
    }

    /**
     * @dev Retrieves the credit score of the caller.
     * @return The credit score of the caller.
     */
    function queryCreditScore() external view returns (uint256) {
        return getCreditScore(msg.sender);
    }
}