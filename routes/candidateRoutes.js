const express = require("express");
const router = express.Router();
const { jwtAuthMiddleware, generateToken } = require("../jwt.js");
const Candidate = require("../models/candidate.js");
const User = require("../models/user.js");

const checkAdminRole = async (userID) => {
  try {
    const user = await User.findById(userID);
    if (user.role === "admin") {
      return true;
    }
  } catch (e) {
    false;
  }
};

router.post("/", jwtAuthMiddleware, async (req, res) => {
  try {
    if (!(await checkAdminRole(req.user.id)))
      return res.status(403).json({ message: "user has no admin role" });

    const data = req.body;

    const newCandidate = new Candidate(data);

    const response = await newCandidate.save();
    console.log("data saved");

    res.status(200).json({ response: response });
  } catch (e) {
    console.log(e);
    res.status(500).json({ e: "internal server error" });
  }
});

router.put("/:candidateID", jwtAuthMiddleware, async (req, res) => {
  try {
    if (!(await checkAdminRole(req.user.id)))
      return res.status(404).json({ message: "user has no admin role" });

    const candidateID = req.params.candidateID;
    const updateCandidateData = req.body;

    const response = await Candidate.findByIdAndUpdate(
      candidateID,
      updateCandidateData,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!response) {
      return res.status(400).json({ error: "Candidate not found" });
    }

    console.log("Candidate data Updated");
    res.sendStatus(200).json(response);
  } catch (e) {
    console.log(e);
    res.status(500).json({ e: "internal server error" });
  }
});

router.delete("/:candidateID", jwtAuthMiddleware, async (req, res) => {
  try {
    if (!(await checkAdminRole(req.user.id)))
      return res.status(403).json({ message: "user has no admin role" });

    const candidateID = req.params.candidateID;

    const response = await Candidate.findByIdAndDelete(candidateID);

    if (!response) {
      return res.status(400).json({ error: "Candidate not found" });
    }

    console.log("Candidate data Deleted");
    res.sendStatus(200).json(response);
  } catch (e) {
    console.log(e);
    res.status(500).json({ e: "internal server error" });
  }
});

router.post("/vote/:candidateID", jwtAuthMiddleware, async (req, res) => {
  candidateID = req.params.candidateID;
  userId = req.user.id;

  try {
    const candidate = await Candidate.findById(candidateID);
    if (!candidate) {
      return res.status(400).json({ error: "Candidate not found" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }
    if (user.isVoted) {
      return res.status(400).json({ error: "User already Voted" });
    }
    if (user.role === "admin") {
      return res.status(403).json({ error: "Admin not allowed" });
    }

    candidate.votes.push({ user: userId });
    candidate.voteCount++;
    await candidate.save();

    user.isVoted = true;
    await user.save();

    res.status(200).json({ message: "Vote Recorded Successfully" });
  } catch (e) {
    console.log(e);
    res.status(500).json({ e: "internal server error" });
  }
});

router.get("/vote/count", async (req, res) => {
  try {
    const candidate = await Candidate.find().sort({ voteCount: "desc" });

    const voteRecord = candidate.map((data) => {
      return {
        party: data.party,
        count: data.voteCount,
      };
    });

    return res.status(200).json(voteRecord);
  } catch (e) {
    console.log(e);
    res.status(500).json({ e: "internal server error" });
  }
});

// router.get("/candidates", async (req, res) => {
//   try {
//     const candidateID = req.params.candidateID;

//     const candidates = await Candidate.findById(candidateID);

//     res.status(200).json(candidates);
//   } catch (e) {
//     console.log(e);
//     res.status(500).json({ e: "internal server error" });
//   }
// });

module.exports = router;
