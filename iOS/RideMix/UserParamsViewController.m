//
//  UserParamsViewController.m
//  RideMix
//
//  Created by Alejandro Rodriguez on 4/16/13.
//  Copyright (c) 2013 Alejandro Rodriguez. All rights reserved.
//

#import "UserParamsViewController.h"

@interface UserParamsViewController ()

@end

@implementation UserParamsViewController

- (id)initWithNibName:(NSString *)nibNameOrNil bundle:(NSBundle *)nibBundleOrNil
{
    self = [super initWithNibName:nibNameOrNil bundle:nibBundleOrNil];
    if (self) {
        // Custom initialization
    }
    return self;
}

- (void)viewDidLoad
{
    [super viewDidLoad];
    self.nameLabel.text = self.name;
    self.profilePicView = [[FBProfilePictureView alloc] initWithProfileID:self.userID pictureCropping:FBProfilePictureCroppingSquare];
    
}

- (void)didReceiveMemoryWarning
{
    [super didReceiveMemoryWarning];
    // Dispose of any resources that can be recreated.
}

@end
