//
//  LoginViewController.m
//  RideMix
//
//  Created by Alejandro Rodriguez on 4/15/13.
//  Copyright (c) 2013 Alejandro Rodriguez. All rights reserved.
//

#import "LoginViewController.h"
#import <FacebookSDK/FacebookSDK.h>
#import "AppDelegate.h"

@interface LoginViewController ()

@property (nonatomic) NSDictionary *currentUser;

@end

@implementation LoginViewController

- (id)initWithNibName:(NSString *)nibNameOrNil bundle:(NSBundle *)nibBundleOrNil
{
    self = [super initWithNibName:nibNameOrNil bundle:nibBundleOrNil];
    if (self) {
        // Custom initialization
    }
    return self;
}

- (void)setCurrentUser:(FBGraphObject *)currentUser
{
    _currentUser = currentUser;
    [self performSegueWithIdentifier:@"Show Parameters" sender:self];
}

- (void)viewDidLoad
{
    [super viewDidLoad];
    // if the session is open, then close it, and prompt for new login.
    AppDelegate *appDelegate = [[UIApplication sharedApplication]delegate];
    appDelegate.session = [[FBSession alloc] init];
    
    if (appDelegate.session.state != FBSessionStateCreatedTokenLoaded) {
        [appDelegate.session closeAndClearTokenInformation];
        [appDelegate.session openWithCompletionHandler:^(FBSession *session, FBSessionState status, NSError *error) {
            if (status == FBSessionStateClosedLoginFailed) [self performSegueWithIdentifier:@"Login Error" sender:self];
            else {
                
            }
        }];
    }
    
    
    /*if (!appDelegate.session.isOpen) {
        [appDelegate.session closeAndClearTokenInformation];
        // create a fresh session object
        appDelegate.session = [[FBSession alloc] init];
        
        [appDelegate.session openWithCompletionHandler:^(FBSession *session, FBSessionState status, NSError *error) {
            if (status == FBSessionStateClosedLoginFailed) [self performSegueWithIdentifier:@"Login Error" sender:self];
            else {
                //NSString *query = @"SELECT first_name, activities, hometown_location, likes_count, pic_small, music, books, tv, games, sports, favorite_athletes, favorite_teams, inspirational_people FROM user WHERE uid = me()";
                // Set up the query parameters
                //NSDictionary *queryParam = [NSDictionary dictionaryWithObjectsAndKeys:query, @"q", [appDelegate.session accessTokenData].accessToken, @"access_token", nil];
                // Make the API request that uses FQL
                //[FBRequestConnection startWithGraphPath:@"/fql" parameters:queryParam HTTPMethod:@"GET" completionHandler:^(FBRequestConnection *connection, id result, NSError *error) {
                  //  if (error) {
                    //    NSLog(@"Error: %@", [error localizedDescription]);
                    //} else {
                      //  NSLog(@"User: %@", result);
                        //self.currentUser = [result objectForKey:@"data"][0];
                    //}
                //}];
            }
        }];
    }*/
}

- (void)prepareForSegue:(UIStoryboardSegue *)segue sender:(id)sender
{
    if ([segue.identifier isEqualToString:@"Show Parameters"]) {
        if ([segue.destinationViewController respondsToSelector:@selector(addUserData:)]) {
            [segue.destinationViewController performSelector:@selector(addUserData:) withObject:self.currentUser];
        } else {
            NSUserDefaults *defaults = [NSUserDefaults standardUserDefaults];
            if (![defaults objectForKey:@"params"]) {
                NSMutableString *params = [[NSMutableString alloc] init];
                [defaults setObject:params forKey:@"params"];
            }
            NSMutableString *newParams = [NSMutableString stringWithString:[defaults objectForKey:@"params"]];
            [newParams appendString:@"\n"];
            [newParams appendString:[self.currentUser description]];
            [defaults setObject:newParams forKey:@"params"];
            [defaults synchronize];
        }
    }
}

- (void)didReceiveMemoryWarning
{
    [super didReceiveMemoryWarning];
    // Dispose of any resources that can be recreated.
}

@end
