// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract TruthRegistry {
    struct VerificationRecord {
        string contentHash;
        uint8 trustScore;
        string mediaType;
        uint256 timestamp;
        bool exists;
    }

    // Mapping from SHA-256 content hash to VerificationRecord
    mapping(string => VerificationRecord) private records;
    // Sequential list of all verified content hashes
    string[] private recordHashes;

    event ContentVerified(
        string indexed contentHashIndexed,
        string contentHash,
        uint8 trustScore,
        string mediaType,
        uint256 timestamp
    );

    // Store a new verification record
    function storeVerification(
        string calldata _contentHash,
        uint8 _trustScore,
        string calldata _mediaType
    ) external {
        require(bytes(_contentHash).length > 0, "Content hash cannot be empty");
        require(_trustScore <= 100, "Trust score must be between 0 and 100");

        if (!records[_contentHash].exists) {
            recordHashes.push(_contentHash);
        }

        records[_contentHash] = VerificationRecord({
            contentHash: _contentHash,
            trustScore: _trustScore,
            mediaType: _mediaType,
            timestamp: block.timestamp,
            exists: true
        });

        emit ContentVerified(
            _contentHash,
            _contentHash,
            _trustScore,
            _mediaType,
            block.timestamp
        );
    }

    // Retrieve a verification record by content hash
    function getVerification(string calldata _contentHash)
        external
        view
        returns (VerificationRecord memory)
    {
        return records[_contentHash];
    }

    // Total count of verified records
    function getRecordCount() external view returns (uint256) {
        return recordHashes.length;
    }

    // Retrieve all recorded content hashes
    function getAllHashes() external view returns (string[] memory) {
        return recordHashes;
    }

    // Retrieve recent records up to a given limit
    function getRecentRecords(uint256 limit)
        external
        view
        returns (VerificationRecord[] memory)
    {
        uint256 total = recordHashes.length;
        if (limit == 0 || limit > total) {
            limit = total;
        }

        VerificationRecord[] memory recent = new VerificationRecord[](limit);
        for (uint256 i = 0; i < limit; i++) {
            string memory hashVal = recordHashes[total - 1 - i];
            recent[i] = records[hashVal];
        }
        return recent;
    }
}
