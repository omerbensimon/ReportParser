const router = require('express').Router();
const Parser = require('./report_parser');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

router.post('/upload', upload.single('singleFile'), async (req, res) => {
    Parser.parser(req, res)
});
router.get('/', (req, res) => {
    res.send('Hello World');
})
module.exports = router;