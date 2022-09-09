const express = require('express');
const router = express.Router();

const bannerController = require('../controller/bannerSliderController');


router.post('/', bannerController.createBannerSlider);
router.get('/', bannerController.getBanners);
router.delete('/:id', bannerController.deleteBanner);


module.exports = router;