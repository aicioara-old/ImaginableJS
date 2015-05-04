<?php


move_uploaded_file( $_FILES['new_image']['tmp_name'], "./image.jpg" );
echo("<img src='image.jpg'>");


