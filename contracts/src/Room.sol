// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {CredToken} from "./CredToken.sol";
import {IdentityRegistry} from "./IdentityRegistry.sol";
import {RoomAccess} from "./RoomAccess.sol";

/// @notice A single engagement room: its own token, posts, engagements, and boost economy.
contract Room is RoomAccess {
    uint8 public constant LIKE = 1;
    uint8 public constant COMMENT = 2;
    uint8 public constant RETWEET = 3;

    struct Post {
        uint256 id;
        address author;
        string tweetUrl;
        uint256 timestamp;
        uint256 totalEngagements;
        uint256 boostPool;
        bool boosted;
    }

    struct Engagement {
        uint256 postId;
        address user;
        uint8 engagementType;
        string proofUrl;
        uint256 timestamp;
        uint256 pointsAwarded;
    }

    CredToken public immutable token;
    IdentityRegistry public immutable identityRegistry;
    address public immutable owner;
    address public immutable treasury;

    string public name;
    bool public isPrivate;
    uint256 public pointsPerLike;
    uint256 public pointsPerComment;
    uint256 public pointsPerRT;
    uint256 public postSubmitCost;

    mapping(address => bool) public isMember;
    address[] public members;

    Post[] public posts;
    Engagement[] public engagements;

    mapping(uint256 => mapping(address => uint256)) public userPostPoints;
    mapping(uint256 => uint256) public totalPostPoints;
    mapping(uint256 => mapping(address => bool)) public hasClaimedBoost;
    mapping(uint256 => mapping(address => mapping(uint8 => bool))) public hasEngagedType;

    event MemberJoined(address indexed member);
    event PostSubmitted(uint256 indexed postId, address indexed author, string tweetUrl);
    event EngagementSubmitted(
        uint256 indexed postId, address indexed user, uint8 engagementType, string proofUrl, uint256 pointsAwarded
    );
    event PostBoosted(uint256 indexed postId, address indexed booster, uint256 amount, uint256 poolAdded);
    event BoostRewardClaimed(uint256 indexed postId, address indexed user, uint256 amount);
    event UserPenalized(address indexed user, uint256 indexed postId, uint256 amountBurned);
    event ConfigUpdated(uint256 pointsPerLike, uint256 pointsPerComment, uint256 pointsPerRT, uint256 postSubmitCost);

    error NotOwner();
    error NotRegistered();
    error NotMember();
    error PrivateRoom();
    error BadPost();
    error BadEngagementType();
    error AlreadyEngaged();
    error ProofRequired();
    error AlreadyClaimed();
    error NothingToClaim();
    error NoBoostPool();

    modifier onlyOwner() {
        if (msg.sender != owner) revert NotOwner();
        _;
    }

    modifier onlyRegistered() {
        if (!identityRegistry.isRegistered(msg.sender)) revert NotRegistered();
        _;
    }

    modifier onlyMember() {
        if (!isMember[msg.sender]) revert NotMember();
        _;
    }

    constructor(
        string memory _name,
        string memory _symbol,
        bool _isPrivate,
        uint256 _pointsPerLike,
        uint256 _pointsPerComment,
        uint256 _pointsPerRT,
        uint256 _postSubmitCost,
        address _owner,
        address _identityRegistry,
        address _treasury
    ) {
        name = _name;
        isPrivate = _isPrivate;
        pointsPerLike = _pointsPerLike;
        pointsPerComment = _pointsPerComment;
        pointsPerRT = _pointsPerRT;
        postSubmitCost = _postSubmitCost;
        owner = _owner;
        identityRegistry = IdentityRegistry(_identityRegistry);
        treasury = _treasury;

        token = new CredToken(_name, _symbol);

        isMember[_owner] = true;
        members.push(_owner);

        // Starter grant so the creator can submit the room's first posts
        // before any engagement income exists.
        token.mint(_owner, _postSubmitCost * 20);
    }

    function _isOwner(address account) internal view override returns (bool) {
        return account == owner;
    }

    function _onJoin(address account) internal override {
        if (!identityRegistry.isRegistered(account)) revert NotRegistered();
        _join(account);
    }

    function _join(address account) internal {
        if (!isMember[account]) {
            isMember[account] = true;
            members.push(account);
            emit MemberJoined(account);
        }
    }

    function joinRoom() external onlyRegistered {
        if (isPrivate) revert PrivateRoom();
        _join(msg.sender);
    }

    function submitPost(string calldata tweetUrl) external onlyRegistered onlyMember {
        token.burn(msg.sender, postSubmitCost);

        uint256 postId = posts.length;
        posts.push(
            Post({
                id: postId,
                author: msg.sender,
                tweetUrl: tweetUrl,
                timestamp: block.timestamp,
                totalEngagements: 0,
                boostPool: 0,
                boosted: false
            })
        );

        emit PostSubmitted(postId, msg.sender, tweetUrl);
    }

    function submitEngagement(uint256 postId, uint8 engagementType, string calldata proofUrl)
        external
        onlyRegistered
        onlyMember
    {
        if (postId >= posts.length) revert BadPost();
        if (engagementType < LIKE || engagementType > RETWEET) revert BadEngagementType();
        if (hasEngagedType[postId][msg.sender][engagementType]) revert AlreadyEngaged();
        if (engagementType != LIKE && bytes(proofUrl).length == 0) revert ProofRequired();

        hasEngagedType[postId][msg.sender][engagementType] = true;

        uint256 pts = engagementType == LIKE
            ? pointsPerLike
            : engagementType == COMMENT ? pointsPerComment : pointsPerRT;

        token.mint(msg.sender, pts);

        userPostPoints[postId][msg.sender] += pts;
        totalPostPoints[postId] += pts;
        posts[postId].totalEngagements += 1;

        engagements.push(
            Engagement({
                postId: postId,
                user: msg.sender,
                engagementType: engagementType,
                proofUrl: proofUrl,
                timestamp: block.timestamp,
                pointsAwarded: pts
            })
        );

        emit EngagementSubmitted(postId, msg.sender, engagementType, proofUrl, pts);
    }

    function boostPost(uint256 postId, uint256 amount) external onlyRegistered onlyMember {
        if (postId >= posts.length) revert BadPost();
        require(amount > 0, "zero amount");

        token.burn(msg.sender, amount);

        uint256 toPool = (amount * 95) / 100;
        uint256 toTreasury = amount - toPool;

        if (toPool > 0) {
            token.mint(address(this), toPool);
            posts[postId].boostPool += toPool;
        }
        if (toTreasury > 0) {
            token.mint(treasury, toTreasury);
        }
        posts[postId].boosted = true;

        emit PostBoosted(postId, msg.sender, amount, toPool);
    }

    function claimBoostReward(uint256 postId) external {
        if (postId >= posts.length) revert BadPost();
        if (hasClaimedBoost[postId][msg.sender]) revert AlreadyClaimed();

        uint256 userPts = userPostPoints[postId][msg.sender];
        if (userPts == 0) revert NothingToClaim();

        uint256 pool = posts[postId].boostPool;
        uint256 totalPts = totalPostPoints[postId];
        if (pool == 0 || totalPts == 0) revert NoBoostPool();

        uint256 share = (pool * userPts) / totalPts;
        hasClaimedBoost[postId][msg.sender] = true;

        require(token.transfer(msg.sender, share), "transfer failed");

        emit BoostRewardClaimed(postId, msg.sender, share);
    }

    function penalize(address user, uint256 postId) external onlyOwner {
        if (postId >= posts.length) revert BadPost();

        uint256 pts = userPostPoints[postId][user];
        require(pts > 0, "no points to penalize");

        userPostPoints[postId][user] = 0;
        totalPostPoints[postId] -= pts;

        token.burn(user, pts);

        emit UserPenalized(user, postId, pts);
    }

    function updateConfig(
        uint256 _pointsPerLike,
        uint256 _pointsPerComment,
        uint256 _pointsPerRT,
        uint256 _postSubmitCost
    ) external onlyOwner {
        pointsPerLike = _pointsPerLike;
        pointsPerComment = _pointsPerComment;
        pointsPerRT = _pointsPerRT;
        postSubmitCost = _postSubmitCost;

        emit ConfigUpdated(_pointsPerLike, _pointsPerComment, _pointsPerRT, _postSubmitCost);
    }

    function getPosts() external view returns (Post[] memory) {
        return posts;
    }

    function getEngagements() external view returns (Engagement[] memory) {
        return engagements;
    }

    function getMemberCount() external view returns (uint256) {
        return members.length;
    }

    function getLeaderboard(uint256 topN) external view returns (address[] memory, uint256[] memory) {
        uint256 n = members.length;
        address[] memory addrs = new address[](n);
        uint256[] memory bals = new uint256[](n);

        for (uint256 i = 0; i < n; i++) {
            addrs[i] = members[i];
            bals[i] = token.balanceOf(members[i]);
        }

        uint256 limit = topN < n ? topN : n;
        for (uint256 i = 0; i < limit; i++) {
            uint256 maxIdx = i;
            for (uint256 j = i + 1; j < n; j++) {
                if (bals[j] > bals[maxIdx]) maxIdx = j;
            }
            if (maxIdx != i) {
                (bals[i], bals[maxIdx]) = (bals[maxIdx], bals[i]);
                (addrs[i], addrs[maxIdx]) = (addrs[maxIdx], addrs[i]);
            }
        }

        address[] memory topAddrs = new address[](limit);
        uint256[] memory topBals = new uint256[](limit);
        for (uint256 i = 0; i < limit; i++) {
            topAddrs[i] = addrs[i];
            topBals[i] = bals[i];
        }

        return (topAddrs, topBals);
    }
}
